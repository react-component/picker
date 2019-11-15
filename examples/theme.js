import '../assets/index.less';
import React, { useState } from 'react';
import Footer from '../src/index';

export default function App() {
  const [theme, setTheme] = useState('light');
  return (
    <div>
      <Footer
        theme={theme}
        columns={[
          {
            title: '相关资源',
            items: [
              {
                title: 'Ant Design Pro',
                url: 'https://pro.ant.design/',
                openExternal: true,
              },
              {
                title: 'Ant Design Mobile',
                url: 'https://mobile.ant.design/',
                openExternal: true,
              },
              {
                title: 'Kitchen',
                url: 'https://kitchen.alipay.com/',
                description: 'Sketch 工具集',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                title: 'Ant Design Pro',
                url: 'https://pro.ant.design/',
                openExternal: true,
              },
              {
                title: 'Ant Design Mobile',
                url: 'https://mobile.ant.design/',
                openExternal: true,
              },
              {
                title: 'Kitchen',
                url: 'https://kitchen.alipay.com/',
                description: 'Sketch 工具集',
              },
            ],
          },
          {
            title: '帮助',
            items: [
              {
                title: 'Ant Design Pro',
                url: 'https://pro.ant.design/',
                openExternal: true,
              },
              {
                title: 'Ant Design Mobile',
                url: 'https://mobile.ant.design/',
                openExternal: true,
              },
              {
                title: 'Kitchen',
                url: 'https://kitchen.alipay.com/',
                description: 'Sketch 工具集',
              },
            ],
          },
          {
            icon: (
              <img
                src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
                alt="more products"
              />
            ),
            title: '更多产品',
            items: [
              {
                icon: (
                  <img
                    src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg"
                    alt="yuque"
                  />
                ),
                title: '语雀',
                url: 'https://yuque.com',
                description: '知识创作与分享工具',
                openExternal: true,
              },
              {
                icon: (
                  <img
                    src="https://gw.alipayobjects.com/zos/rmsportal/uHocHZfNWZOdsRUonZNr.png"
                    alt="yuque"
                  />
                ),
                title: '云凤蝶',
                url: 'https://yunfengdie.com',
                description: '中台建站平台',
                openExternal: true,
              },
              {
                title: (
                  <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    Switch Theme to {theme === 'dark' ? 'light' : 'dark'}
                  </button>
                ),
              },
            ],
          },
        ]}
        bottom="Made with ❤️ by AFX"
      />
    </div>
  );
}
