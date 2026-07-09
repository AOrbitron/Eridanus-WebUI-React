import {
  getFunctionList,
  saveDisabledFunctions,
  getSkillList,
  saveDisabledSkills,
} from '@/services/ant-design-pro/api';
import {
  Alert,
  Affix,
  Button,
  Card,
  Collapse,
  Empty,
  List,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd';
import React, { useEffect, useState } from 'react';
import QueueAnim from '@/components/QueueAnim';

const { Text } = Typography;

interface FuncItem {
  name: string;
  description: string;
  enabled: boolean;
}
interface PluginItem {
  plugin: string;
  description: string;
  functions: FuncItem[];
}
interface SkillItem {
  name: string;
  description: string;
  enabled: boolean;
}

const affixBarStyle: React.CSSProperties = {
  borderRadius: 8,
  backdropFilter: 'blur(8px)',
  padding: 10,
  boxShadow: '0 0 10px rgba(112, 112, 112, 0.4)',
  width: '100%',
  marginBottom: 16,
};

const FunctionManager: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [disabledFns, setDisabledFns] = useState<Set<string>>(new Set());
  const [disabledSkills, setDisabledSkills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [savingFns, setSavingFns] = useState<boolean>(false);
  const [savingSkills, setSavingSkills] = useState<boolean>(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([getFunctionList(), getSkillList()])
      .then(([fnRes, skillRes]) => {
        const pl: PluginItem[] = fnRes?.plugins || [];
        setPlugins(pl);
        const dFns = new Set<string>();
        pl.forEach((p) =>
          p.functions.forEach((f) => {
            if (!f.enabled) dFns.add(f.name);
          }),
        );
        setDisabledFns(dFns);

        const sk: SkillItem[] = skillRes?.skills || [];
        setSkills(sk);
        const dSk = new Set<string>();
        sk.forEach((s) => {
          if (!s.enabled) dSk.add(s.name);
        });
        setDisabledSkills(dSk);
      })
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleFn = (name: string, enabled: boolean) => {
    setDisabledFns((prev) => {
      const next = new Set(prev);
      if (enabled) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSkill = (name: string, enabled: boolean) => {
    setDisabledSkills((prev) => {
      const next = new Set(prev);
      if (enabled) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const setPluginAll = (plugin: PluginItem, enabled: boolean) => {
    setDisabledFns((prev) => {
      const next = new Set(prev);
      plugin.functions.forEach((f) => {
        if (enabled) next.delete(f.name);
        else next.add(f.name);
      });
      return next;
    });
  };

  const saveFns = async () => {
    setSavingFns(true);
    try {
      const res = await saveDisabledFunctions({ disabled: Array.from(disabledFns) });
      if (res?.message) message.success(res.message);
      else if (res?.error) message.error(res.error);
    } catch {
      message.error('保存失败');
    } finally {
      setSavingFns(false);
    }
  };

  const saveSkills = async () => {
    setSavingSkills(true);
    try {
      const res = await saveDisabledSkills({ disabled: Array.from(disabledSkills) });
      if (res?.message) message.success(res.message);
      else if (res?.error) message.error(res.error);
    } catch {
      message.error('保存失败');
    } finally {
      setSavingSkills(false);
    }
  };

  const totalFns = plugins.reduce((n, p) => n + p.functions.length, 0);
  const activeFns = plugins.reduce(
    (n, p) => n + p.functions.filter((f) => !disabledFns.has(f.name)).length,
    0,
  );
  const activeSkills = skills.filter((s) => !disabledSkills.has(s.name)).length;

  const pluginItems: CollapseProps['items'] = plugins.map((p) => {
    const on = p.functions.filter((f) => !disabledFns.has(f.name)).length;
    return {
      key: p.plugin,
      label: (
        <Space wrap>
          <Text strong>{p.description}</Text>
          <Tag>{p.plugin}</Tag>
          <Text type="secondary">
            {on}/{p.functions.length} 启用
          </Text>
        </Space>
      ),
      extra: (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button size="small" onClick={() => setPluginAll(p, true)}>
            全开
          </Button>
          <Button size="small" onClick={() => setPluginAll(p, false)}>
            全关
          </Button>
        </Space>
      ),
      children: (
        <List
          dataSource={p.functions}
          renderItem={(f) => (
            <List.Item
              actions={[
                <Switch
                  key="sw"
                  checked={!disabledFns.has(f.name)}
                  onChange={(checked) => toggleFn(f.name, checked)}
                />,
              ]}
            >
              <List.Item.Meta
                title={<Text code>{f.name}</Text>}
                description={f.description || '（无描述）'}
              />
            </List.Item>
          )}
        />
      ),
    };
  });

  return (
    <QueueAnim type={'bottom'} delay={100}>
      <Alert
        key="tip"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="按需关闭很少用到的函数 / 技能，可减少每轮对话发送给大模型的 token。修改保存后，下一条对话即生效，无需重启。"
      />

      <Card
        key="fns"
        title="函数（Tools）"
        loading={loading}
        extra={
          <Text type="secondary">
            {activeFns}/{totalFns} 启用
          </Text>
        }
      >
        <Affix offsetTop={60}>
          <Space wrap style={affixBarStyle}>
            <Button icon={<ReloadOutlined />} onClick={loadAll}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingFns}
              onClick={saveFns}
              style={{ float: 'right' }}
            >
              保存函数开关
            </Button>
          </Space>
        </Affix>
        {plugins.length ? (
          <Collapse items={pluginItems} />
        ) : (
          <Empty description="没有可管理的函数" />
        )}
      </Card>

      <Card
        key="skills"
        title="技能（Skills）"
        loading={loading}
        style={{ marginTop: 16 }}
        extra={
          <Text type="secondary">
            {activeSkills}/{skills.length} 启用
          </Text>
        }
      >
        <Affix offsetTop={60}>
          <Space wrap style={affixBarStyle}>
            <Button icon={<ReloadOutlined />} onClick={loadAll}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingSkills}
              onClick={saveSkills}
              style={{ float: 'right' }}
            >
              保存技能开关
            </Button>
          </Space>
        </Affix>
        {skills.length ? (
          <List
            dataSource={skills}
            renderItem={(s) => (
              <List.Item
                actions={[
                  <Switch
                    key="sw"
                    checked={!disabledSkills.has(s.name)}
                    onChange={(checked) => toggleSkill(s.name, checked)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<Text code>{s.name}</Text>}
                  description={s.description}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="没有检测到 skill 包（skills/ 目录为空或未启用）" />
        )}
      </Card>
    </QueueAnim>
  );
};

export default FunctionManager;
