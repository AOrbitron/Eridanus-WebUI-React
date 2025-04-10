import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

//页脚
const Footer: React.FC = () => {
  return (
    <DefaultFooter
      // style={{
      //   background: 'none',
      // }}
      // links={[
      //   {
      //     key: 'Ant Design Pro',
      //     title: 'Ant Design Pro',
      //     href: 'https://pro.ant.design',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: (
      //       <span>
      //         <GithubOutlined style={{ marginRight: 2 }} />
      //         项目Github
      //       </span>
      //     ),
      //     href: 'https://github.com/ant-design/ant-design-pro',
      //     blankTarget: true,
      //   },
      // ]}
    />
  );
};

export default Footer;
