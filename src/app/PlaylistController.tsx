import React, { useEffect, useRef, useState } from 'react';
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
        id="music-playlist-panel"
        className={`app-player${collapsed ? ' app-player-collapsed' : ''}`}
        aria-label="音乐播放列表"
      >
        <div ref={containerRef} />
        {!songs.length && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <div>🎵 暂无播放列表</div>
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
              请添加音乐到播放列表
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className={`app-player-toggle${collapsed ? ' app-player-toggle-collapsed' : ''}`}
        aria-label={collapsed ? '展开播放列表' : '收起播放列表'}
        title={collapsed ? '展开播放列表' : '收起播放列表'}
        aria-expanded={!collapsed}
        aria-controls="music-playlist-panel"
        onClick={() => setCollapsed((value) => !value)}
      >
        {collapsed ? <LeftOutlined /> : <RightOutlined />}
      </button>
    </>
  );
};

export default PlaylistController;
