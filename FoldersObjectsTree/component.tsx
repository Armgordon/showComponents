import React from 'react';
import type { FC } from 'react';
import classnames from 'classnames';
import { componentDisplayName } from '@components/common/utils';

import styles from './styles.scss';
import type { Props } from './types';
import { useSelectContainerClassName, useShadowRootFoldersObjectsTree } from './behavior';

/** `FoldersObjectsTree` component */
const Component: FC<Props> = ({
  className,
  formValue,
  formOnChange,
  externalShadowRoot,
  isGroupedObjectsView,
  search,
}) => {
  const shadowRootFoldersObjectsTree = useShadowRootFoldersObjectsTree({
    formOnChange,
    formValue,
    externalShadowRoot,
    isGroupedObjectsView,
    search,
  });
  const selectContainerClassName = useSelectContainerClassName(!!externalShadowRoot);

  return (
    <div className={classnames(styles.root, className)}>
      <div className={selectContainerClassName}>{shadowRootFoldersObjectsTree}</div>
    </div>
  );
};
Component.displayName = componentDisplayName('FoldersObjectsTree', __filename);

export default Component;
