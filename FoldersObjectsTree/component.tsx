import type { FC, ReactNode } from 'react';
import React from 'react';
import classnames from 'classnames';
import { checkFolderHasChild, componentDisplayName } from '@components/common/utils';

import { ProviderResourceType } from '@domain';
import type { AttachedResource, Folder, Resource } from '@domain';
import type {
  ChildOptionPropsBefore,
  OptionPropsBefore,
  RenderResourceOptionsParams,
} from '@components/common/objectTrees';
import { isEmpty } from 'lodash';
import Option from '@components/common/objectTrees/shareNodes/Option';

import { useInitialExpandedFoldersState } from '@components/common/customHooks';
import ChildOption from '@components/common/objectTrees/shareNodes/ChildOption/component';
import { getResourceTypeArg } from '@components/common/ModalManager/utils';

import {
  useCalcPadding,
  useExpandedState,
  useFoldersFactory,
  useFoldersLoadMore,
  useGetCanExpand,
  useGetOptionId,
  useGroupedResourcesFactory,
  useOptionClickHandler,
  useProviderOptions,
  useRenderFolder,
  useRenderGroupedResource,
  useAttachedResourcesFactory,
  useRenderResource,
} from '../customTreeHooks';
import {
  useFilterResourcesCallback,
  useFolderMatchSearch,
  useInitialSelectedFoldersObjects,
  useSelectedGroupedResourceState,
  useSelectedResourcesState,
  useSelectFolder,
} from './behavior';
import type { Props } from './types';
import styles from './styles.scss';

/** `FoldersObjectsTree` component */
const Component: FC<Props> = ({ providerId, className, formValue, formOnChange, isGroupedObjectsView, search }) => {
  const getOptionId = useGetOptionId();

  const { foldersOptions, groupedResourcesOptions } = useProviderOptions(providerId);

  const initialExpanded = useInitialExpandedFoldersState(providerId);
  const initialSelected = useInitialSelectedFoldersObjects(formValue, providerId);

  const {
    expanded: expandedFolders,
    toggleOption: toggleFolderOption,
    expandOption: expandFolderOption,
  } = useExpandedState(initialExpanded.folders);

  const toggleSelectFolders = useSelectFolder(formValue, formOnChange, providerId);

  const foldersFactory = useFoldersFactory();
  const getFolderCanExpand = useGetCanExpand<Folder>('has_child');
  const renderFolderOption = useRenderFolder();
  const onFolderClickHandler = useOptionClickHandler(toggleSelectFolders);

  const groupedResourcesFactory = useGroupedResourcesFactory();
  const renderGroupedOption = useRenderGroupedResource();
  const toggleSelectGrouped = useSelectedGroupedResourceState(formValue, formOnChange, providerId);
  const onGroupedResourceClickHandler = useOptionClickHandler(toggleSelectGrouped);

  const calcPadding = useCalcPadding();

  const onEmptyFolderExpand = useFoldersLoadMore();

  const resourcesFactory = useAttachedResourcesFactory();
  const renderResourceOption = useRenderResource();
  const toggleSelectResources = useSelectedResourcesState(formValue, formOnChange, providerId);
  const onResourceClickHandler = useOptionClickHandler(toggleSelectResources);

  const folderMatchSearch = useFolderMatchSearch({ search, foldersFactory });
  const filterResourcesCallback = useFilterResourcesCallback(search);

  function renderFolderOptions(optionsList: Folder[], nestingDepth: number, parentPadding: number) {
    const result: ReactNode[] = [];

    const propsList: OptionPropsBefore<Folder>[] = optionsList
      .filter(folderMatchSearch)
      .map((option, index): OptionPropsBefore<Folder> => {
        const id = getOptionId(option);
        const isExpanded = expandedFolders.has(id);
        const isSelected = initialSelected.folders.has(id);
        const value = foldersFactory(option);

        const hasChildren = checkFolderHasChild(value?.value);

        const canExpand = getFolderCanExpand(option, hasChildren);

        return {
          id,
          isExpanded,
          isSelected,
          toggleOption: toggleFolderOption,
          index,
          nestingDepth,
          renderOption: renderFolderOption,
          expandOption: expandFolderOption,
          onOptionClick: onFolderClickHandler,
          value,
          canExpand,
          hasChildren,
          className: styles.optionName,
        };
      });

    const expandPadding = propsList.some(({ canExpand }) => canExpand);
    const padding = calcPadding({
      parentPadding,
      expandPadding,
      nestingDepth,
    });

    propsList.forEach(({ value, ...props }) => {
      result.push(
        <Option<Folder>
          {...props}
          value={value.value}
          key={`${props.id}${nestingDepth}`}
          padding={padding}
          onEmptyExpand={onEmptyFolderExpand}
        />,
      );

      if (props.isExpanded && props.hasChildren) {
        const childElements = value.toChildren().map((item) => item.value);

        result.push(
          ...renderFolderOptions(childElements, nestingDepth + 1, padding),
          ...renderResourceOptions({
            optionsList: value.value.storages,
            nestingDepth: nestingDepth + 1,
            parentPadding: padding,
            type: ProviderResourceType.STORAGE,
          }),
          ...renderResourceOptions({
            optionsList: value.value.networks,
            nestingDepth: nestingDepth + 1,
            parentPadding: padding,
            type: ProviderResourceType.NETWORK,
          }),
          ...renderResourceOptions({
            optionsList: value.value.virtual_machines,
            nestingDepth: nestingDepth + 1,
            parentPadding: padding,
            type: ProviderResourceType.VIRTUAL_MACHINE,
          }),
          ...renderResourceOptions({
            optionsList: value.value.hosts,
            nestingDepth: nestingDepth + 1,
            parentPadding: padding,
            type: ProviderResourceType.HOST,
          }),
        );
      }
    });

    return result;
  }

  function renderGroupedResourceOptions(optionsList: Resource[], nestingDepth: number, parentPadding: number) {
    const result: ReactNode[] = [];

    const propsList: OptionPropsBefore<Resource>[] = optionsList.map((option, index): OptionPropsBefore<Resource> => {
      const id = getResourceTypeArg(option.id);
      const isExpanded = expandedFolders.has(id);

      const value = groupedResourcesFactory(option);
      const hasChildren = !isEmpty(value.toChildren());

      const isSelected =
        hasChildren &&
        value.toChildren().every((item) => {
          const idOfChildResource = getOptionId(item.value, id);
          return initialSelected.resources.has(idOfChildResource);
        });

      return {
        id,
        isExpanded,
        isSelected,
        toggleOption: toggleFolderOption,
        index,
        nestingDepth,
        renderOption: renderGroupedOption,
        expandOption: expandFolderOption,
        onOptionClick: onGroupedResourceClickHandler,
        value,
        canExpand: hasChildren,
        hasChildren,
        className: styles.optionName,
      };
    });

    const expandPadding = propsList.some(({ canExpand }) => canExpand);
    const padding = calcPadding({
      parentPadding,
      expandPadding,
      nestingDepth,
    });

    propsList.forEach(({ value, ...props }) => {
      result.push(
        <Option<Resource> {...props} value={value.value} key={`${props.id}${nestingDepth}`} padding={padding} />,
      );

      if (props.isExpanded && props.hasChildren) {
        const childElements = value.toChildren().map((item) => item.value);

        result.push(
          ...renderResourceOptions({
            optionsList: childElements,
            nestingDepth: nestingDepth + 1,
            parentPadding: padding,
            type: getResourceTypeArg(value.value.id),
          }),
        );
      }
    });

    return result;
  }

  function renderResourceOptions({ optionsList, nestingDepth, parentPadding, type }: RenderResourceOptionsParams) {
    const result: ReactNode[] = [];
    const propsList: ChildOptionPropsBefore[] = optionsList
      .filter(filterResourcesCallback)
      .map((option, index): ChildOptionPropsBefore => {
        const id = getOptionId(option, type);
        const isSelected = initialSelected.resources.has(id);

        const value = resourcesFactory(option);

        return {
          id,
          isSelected,
          index,
          nestingDepth,
          renderOption: renderResourceOption,
          onOptionClick: onResourceClickHandler,
          value,
          className: styles.optionName,
        };
      });

    const padding = calcPadding({
      parentPadding,
      nestingDepth,
      isResource: true,
    });

    propsList.forEach(({ value, ...props }) => {
      result.push(
        <ChildOption<AttachedResource>
          {...props}
          value={value.value}
          key={`${props.id}${nestingDepth}`}
          padding={padding}
        />,
      );
    });

    return result;
  }

  return (
    <div className={classnames(styles.root, className)}>
      {isGroupedObjectsView && renderGroupedResourceOptions(groupedResourcesOptions, 0, 16)}
      {!isGroupedObjectsView && (
        <>
          {!foldersOptions.length && <div className={styles.noOptionMessage}>Нет доступных папок или объектов</div>}
          {renderFolderOptions(foldersOptions, 0, 16)}
        </>
      )}
    </div>
  );
};
Component.displayName = componentDisplayName('FoldersObjectsTree', __filename);

export default Component;
