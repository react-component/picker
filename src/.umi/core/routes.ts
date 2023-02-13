// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from '/Users/xx/Workspace/picker/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/~demos/:uuid",
    "layout": false,
    "wrappers": [require('../dumi/layout').default],
    "component": ((props) => {
        const React = require('react');
        const { default: getDemoRenderArgs } = require('/Users/xx/Workspace/picker/node_modules/@umijs/preset-dumi/lib/plugins/features/demo/getDemoRenderArgs');
        const { default: Previewer } = require('dumi-theme-default/es/builtins/Previewer.js');
        const { usePrefersColor, context } = require('dumi/theme');

        
      const { demos } = React.useContext(context);
      const [renderArgs, setRenderArgs] = React.useState([]);

      // update render args when props changed
      React.useLayoutEffect(() => {
        setRenderArgs(getDemoRenderArgs(props, demos));
      }, [props.match.params.uuid, props.location.query.wrapper, props.location.query.capture]);

      // for listen prefers-color-schema media change in demo single route
      usePrefersColor();

      switch (renderArgs.length) {
        case 1:
          // render demo directly
          return renderArgs[0];

        case 2:
          // render demo with previewer
          return React.createElement(
            Previewer,
            renderArgs[0],
            renderArgs[1],
          );

        default:
          return `Demo ${props.match.params.uuid} not found :(`;
      }
    
        })
  },
  {
    "path": "/_demos/:uuid",
    "redirect": "/~demos/:uuid"
  },
  {
    "__dumiRoot": true,
    "layout": false,
    "path": "/",
    "wrappers": [require('../dumi/layout').default, require('/Users/xx/Workspace/picker/node_modules/dumi-theme-default/es/layout.js').default],
    "routes": [
      {
        "path": "/",
        "component": require('/Users/xx/Workspace/picker/README.md').default,
        "exact": true,
        "meta": {
          "locale": "en-US",
          "order": null,
          "filePath": "README.md",
          "updatedTime": 1640868676000,
          "slugs": [
            {
              "depth": 1,
              "value": "rc-picker",
              "heading": "rc-picker"
            },
            {
              "depth": 2,
              "value": "Live Demo",
              "heading": "live-demo"
            },
            {
              "depth": 2,
              "value": "Install",
              "heading": "install"
            },
            {
              "depth": 2,
              "value": "Usage",
              "heading": "usage"
            },
            {
              "depth": 2,
              "value": "API",
              "heading": "api"
            },
            {
              "depth": 3,
              "value": "Picker",
              "heading": "picker"
            },
            {
              "depth": 3,
              "value": "PickerPanel",
              "heading": "pickerpanel"
            },
            {
              "depth": 3,
              "value": "RangePicker",
              "heading": "rangepicker"
            },
            {
              "depth": 3,
              "value": "showTime-options",
              "heading": "showtime-options"
            },
            {
              "depth": 2,
              "value": "Development",
              "heading": "development"
            },
            {
              "depth": 2,
              "value": "License",
              "heading": "license"
            }
          ],
          "title": "rc-picker"
        },
        "title": "rc-picker"
      },
      {
        "path": "/demo/basic",
        "component": require('/Users/xx/Workspace/picker/docs/demo/basic.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/basic.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "basic",
              "heading": "basic"
            }
          ],
          "title": "basic",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "basic - rc-picker"
      },
      {
        "path": "/demo/calendar",
        "component": require('/Users/xx/Workspace/picker/docs/demo/calendar.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/calendar.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "calendar",
              "heading": "calendar"
            }
          ],
          "title": "calendar",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "calendar - rc-picker"
      },
      {
        "path": "/demo/customize",
        "component": require('/Users/xx/Workspace/picker/docs/demo/customize.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/customize.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "customize",
              "heading": "customize"
            }
          ],
          "title": "customize",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "customize - rc-picker"
      },
      {
        "path": "/demo/disabled-date",
        "component": require('/Users/xx/Workspace/picker/docs/demo/disabledDate.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/disabledDate.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "disabledDate",
              "heading": "disableddate"
            }
          ],
          "title": "disabledDate",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "disabledDate - rc-picker"
      },
      {
        "path": "/demo/modes",
        "component": require('/Users/xx/Workspace/picker/docs/demo/modes.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/modes.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "modes",
              "heading": "modes"
            }
          ],
          "title": "modes",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "modes - rc-picker"
      },
      {
        "path": "/demo/panel",
        "component": require('/Users/xx/Workspace/picker/docs/demo/panel.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/panel.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "panel",
              "heading": "panel"
            }
          ],
          "title": "panel",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "panel - rc-picker"
      },
      {
        "path": "/demo/panel-render",
        "component": require('/Users/xx/Workspace/picker/docs/demo/panelRender.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/panelRender.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "panelRender",
              "heading": "panelrender"
            }
          ],
          "title": "panelRender",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "panelRender - rc-picker"
      },
      {
        "path": "/demo/range",
        "component": require('/Users/xx/Workspace/picker/docs/demo/range.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/range.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "range",
              "heading": "range"
            }
          ],
          "title": "range",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "range - rc-picker"
      },
      {
        "path": "/demo/rtl",
        "component": require('/Users/xx/Workspace/picker/docs/demo/rtl.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/rtl.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "rtl",
              "heading": "rtl"
            }
          ],
          "title": "rtl",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "rtl - rc-picker"
      },
      {
        "path": "/demo/switch-type",
        "component": require('/Users/xx/Workspace/picker/docs/demo/switchType.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/switchType.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "switchType",
              "heading": "switchtype"
            }
          ],
          "title": "switchType",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "switchType - rc-picker"
      },
      {
        "path": "/demo/time",
        "component": require('/Users/xx/Workspace/picker/docs/demo/time.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/time.md",
          "updatedTime": 1640868676000,
          "slugs": [
            {
              "depth": 2,
              "value": "time",
              "heading": "time"
            }
          ],
          "title": "time",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "time - rc-picker"
      },
      {
        "path": "/demo/uncontrolled",
        "component": require('/Users/xx/Workspace/picker/docs/demo/uncontrolled.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/demo/uncontrolled.md",
          "updatedTime": 1640671940000,
          "slugs": [
            {
              "depth": 2,
              "value": "uncontrolled",
              "heading": "uncontrolled"
            }
          ],
          "title": "uncontrolled",
          "hasPreviewer": true,
          "group": {
            "path": "/demo",
            "title": "Demo"
          }
        },
        "title": "uncontrolled - rc-picker"
      },
      {
        "path": "/demo",
        "meta": {},
        "exact": true,
        "redirect": "/demo/basic"
      }
    ],
    "title": "rc-picker",
    "component": (props) => props.children
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
