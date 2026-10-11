import React, { useEffect, useRef, useState } from 'react';
import { Button, Empty, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

type Song = { name: string; artist: string; [key: string]: unknown };
type Player = { list: { add: (song: Song) => void }; destroy?: () => void };
type PlayerConstructor = new (options: Record<string, unknown>) => Player;

declare global {
  interface Window {
    APlayer?: PlayerConstructor;
  }
}

type Props = { isDark: boolean };

const PlaylistController: React.FC<Props> = ({ isDark }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const playerRef = useRef<Player | undefined>(undefined);
  const playerSongCount = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    const addSong = (event: Event) => {
      const song = (event as CustomEvent<Song>).detail;
      if (!song?.name || typeof song.artist !== 'string') return;
      setSongs((current) =>
        current.some((item) => item.name === song.name && item.artist === song.artist)
          ? current
          : [...current, song],
      );
    };
    window.addEventListener('add-to-playlist', addSong);
    return () => window.removeEventListener('add-to-playlist', addSong);
  }, []);

  useEffect(() => {
    if (!songs.length) return;
    if (playerRef.current) {
      songs.slice(playerSongCount.current).forEach((song) => playerRef.current?.list.add(song));
      playerSongCount.current = songs.length;
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const createPlayer = () => {
      if (cancelled) return;
      if (!window.APlayer || !containerRef.current) {
        timeout = setTimeout(createPlayer, 500);
        return;
      }
      playerRef.current = new window.APlayer({
        container: containerRef.current,
        loop: 'all',
        order: 'list',
        audio: songs,
        lrcType: 3,
      });
      playerSongCount.current = songs.length;
    };
    createPlayer();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [songs]);

  useEffect(
    () => () => {
      playerRef.current?.destroy?.();
    },
    [],
  );

  return (
    <>
      <div
        ref={containerRef}
        className={`app-player${collapsed ? ' app-player-collapsed' : ''}`}
        aria-label="音乐播放列表"
      >
        {!songs.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无播放列表" />}
      </div>
      <Tooltip title={collapsed ? '展开播放列表' : '收起播放列表'}>
        <Button
          className={`app-player-toggle${collapsed ? ' app-player-toggle-collapsed' : ''}`}
          aria-label={collapsed ? '展开播放列表' : '收起播放列表'}
          icon={collapsed ? <LeftOutlined /> : <RightOutlined />}
          onClick={() => setCollapsed((value) => !value)}
        />
      </Tooltip>
    </>
  );
};

export default PlaylistController;
