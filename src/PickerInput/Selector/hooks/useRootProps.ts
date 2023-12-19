import * as React from 'react';

export default function useRootProps(props: React.HTMLAttributes<any>) {
  const propNames = ['onMouseEnter', 'onMouseLeave'];

  return React.useMemo(() => {
    const rootProps: React.HTMLAttributes<any> = {};

    propNames.forEach((propName) => {
      if (props[propName]) {
        rootProps[propName] = props[propName];
      }
    });

    return rootProps;
  }, [props]);
}
