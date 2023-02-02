import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import root from 'react-shadow';
import { useDispatch, useSelector } from 'react-redux';
import type { TreeNodeInfo } from '@blueprintjs/core';
import { Classes, Tree } from '@blueprintjs/core';
import type { Folder, FieldFoldersAndObjects, ChildFieldObject, ResourceId, Resource } from '@domain';
import { ProviderResourceType } from '@domain';
import type { State } from '@store';
import {
  getExpandedFolders,
  getNodesCollection,
  getProviderId,
  addChildFolders,
  setProviderNodesCollection,
  setStoreExpandedFolders,
} from '@store/providerFileSystem';
import ComplexIcon from '@components/common/ComplexIcon';
import {
  useBlankNode,
  useShadowRootStyles,
} from '@components/common/ConstructModal/FoldersObjectsSelect/customHooks/ShadowRootTreeHooks';
import type { ComplexIconType } from '@components/common/ComplexIcon';
import {
  useCurrentFolder,
  useCurrentFolderId,
  useFolderChildList,
  useGetResources,
} from '@components/common/customHooks';
import {
  getProviderResourceLabelWithNoName,
  getProviderResourceTypeDisplayName,
  PROVIDERS_DIGITAL_CODE_LENGTH,
  PROVIDER_RESOURCE_TYPES_DIGITAL_ID,
} from '@components/common/utils';
import { isFolder } from '@utils/guards';
import classnames from 'classnames';
import type { AttachedResource } from '@domain/provider/fileSystem';

import type {
  CheckContainsOfChildFieldObjectParams,
  IFormValuesState,
  ISelectedObjects,
  NodePath,
  UseHandlersParams,
  UseHandlersResult,
  UseMakeNodeListParams,
  UseNodesParams,
  UseShadowRootFoldersObjectsTreeParams,
} from './types';
import styles from './styles.scss';

/* eslint-disable camelcase */

/** Function which concats Synthethic ID of resource with provider's ID.
 * Then resulted string can be parsed to receive objects from certain provider
 * @param resourceId - see {@link ProviderResourceType}
 * @param providerId - ID of provider
 * @return string like '11111111298', where '11111111' is synthetic Id of grouped resources and '298' is provider ID
 */
const getGroupId = (resourceId: ResourceId, providerId: number | null): string => {
  if (typeof resourceId === 'number') return '';
  return `${PROVIDER_RESOURCE_TYPES_DIGITAL_ID.get(resourceId)}${providerId?.toString()}`;
};

/** Function which parses string with Synthetic Id of grouped objects and provider Id
 * @params nodeId - string like '11111111298', where '11111111' is synthetic Id of grouped resources and '298' is provider ID or ID of the objects (number)
 * @return if nodeId is Synthetic Id, return synthetic ID of grouped objects. If nodeId is number, returns null
 */
const getProviderResourceTypeOfNodeId = (nodeId: string | number) =>
  typeof nodeId === 'string' ? Number(nodeId.slice(0, PROVIDERS_DIGITAL_CODE_LENGTH)) : null;

/** Hook which transform Resources of Current provider to the TreeNode
 * @return Array of {@link TreeNodeInfo} with the provider's resources to the select form
 */
export const useGetResourcesNodes = (): TreeNodeInfo[] => {
  const { providerId, grouped, virtual_machines, networks, storages } = useGetResources();

  return grouped.map((resource) => ({
    id: getGroupId(resource.id, providerId),
    label: getProviderResourceTypeDisplayName(resource.id, true),
    hasCaret: !!virtual_machines.length || !!networks.length || !!storages.length,
    nodeData: {
      provider_id: providerId,
      networks,
      storages,
      virtual_machines,
    },
  }));
};

/**
 * Hook which returns loaded nodes collection made from all used folders in current tree
 * @param isGroupedObjectsView - flag that indicates that select form is in `Objects` state
 * @returns Array of nodes {@link TreeNodeInfo} made from redux-store folder items saved at store
 */
export const useNodesCollection = (isGroupedObjectsView?: boolean): TreeNodeInfo[] | null => {
  const nodesCollectionSelector = useCallback((state: State): TreeNodeInfo[] | null => getNodesCollection(state), []);
  const foldersCollection = useSelector(nodesCollectionSelector) || [];
  const resourcesNodes = useGetResourcesNodes();

  return isGroupedObjectsView ? resourcesNodes : foldersCollection;
};

/** Hook which return callback to create folder node {@link TreeNodeInfo} from {@link Folder}
 * @return Callback which receives child folders list and selected folders destructed state from {@link IFormValuesState} */
export const useMakeFolderNode = (): ((value: Folder[] | null, formState: IFormValuesState) => TreeNodeInfo[]) =>
  useCallback((childFolders: Folder[] | null, { selectedFolders }: IFormValuesState) => {
    if (!childFolders) return [];
    const result: TreeNodeInfo[] = [];

    childFolders.forEach((childFolder) => {
      const isSelected = selectedFolders.includes(childFolder?.id) || false;
      const hasCaret =
        childFolder.has_child ||
        childFolder.networks.length > 0 ||
        childFolder.storages.length > 0 ||
        childFolder.virtual_machines.length > 0;

      result.push({
        id: childFolder.id,
        icon: <ComplexIcon type="folder" isChecked={isSelected} />,
        label: childFolder.name,
        isSelected,
        hasCaret,
        nodeData: {
          id: childFolder.id,
          provider_id: childFolder.provider_id,
          has_child: childFolder.has_child,
          networks: childFolder.networks,
          storages: childFolder.storages,
          virtual_machines: childFolder.virtual_machines,
        },
      });
    });

    return result;
  }, []);

/**
 * Hook which returns available options for folders and objects tree element. We use `useMemo` instead of
 * constant to save possibility to create dynamic options list generation.
 * It recursively put child folder nodes and resources in parent `childNodes` field
 * @returns All available tree nodes {@link TreeNodeInfo}
 */
export const useMakeNodeList = ({
  nodesCollection,
  childNodes,
  formValuesState: { selectedFolders, selectedObjects },
  expandedFolders,
  isGroupedObjectsView,
  search,
}: UseMakeNodeListParams): TreeNodeInfo[] => {
  const currentFolderId = useCurrentFolderId();

  const currentFolder = useCurrentFolder(currentFolderId);

  const { providerId, virtual_machines, networks, storages } = useGetResources();
  const searchValue = search?.toLowerCase() ?? '';

  const getNodesOutOfResources = useCallback(
    (resourceType: ProviderResourceType, groupedObjectsView: boolean) => {
      let filteringObjects: AttachedResource[] | Resource[] = [];
      let objectsForSelection: number[] = [];
      let iconSign = '';
      switch (resourceType) {
        case ProviderResourceType.VIRTUAL_MACHINE:
          filteringObjects = groupedObjectsView ? virtual_machines : currentFolder?.virtual_machines || [];
          objectsForSelection = selectedObjects.vm;
          iconSign = 'v';
          break;
        case ProviderResourceType.NETWORK:
          filteringObjects = groupedObjectsView ? networks : currentFolder?.networks || [];
          objectsForSelection = selectedObjects.networks;
          iconSign = 'n';
          break;
        case ProviderResourceType.STORAGE:
          filteringObjects = groupedObjectsView ? storages : currentFolder?.storages || [];
          objectsForSelection = selectedObjects.storages;
          iconSign = 's';
          break;
        default:
          break;
      }

      const filteringCallback = (resource: AttachedResource | Resource) => {
        if ('provider' in resource) {
          return resource.provider === providerId && resource.name.toLowerCase().includes(searchValue);
        }
        return resource.name.toLowerCase().includes(searchValue);
      };

      return filteringObjects.filter(filteringCallback).map((resource) => {
        const isSelected = objectsForSelection.includes(Number(resource.id));
        return {
          id: `${resource.id}${iconSign}`,
          icon: <ComplexIcon type={resourceType} isChecked={isSelected} />,
          label: resource.name || getProviderResourceLabelWithNoName(resource.id, ProviderResourceType.VIRTUAL_MACHINE),
          isSelected,
          nodeData: resource,
        };
      });
    },
    [
      providerId,
      searchValue,
      virtual_machines,
      networks,
      storages,
      selectedObjects.vm,
      selectedObjects.networks,
      selectedObjects.storages,
      currentFolder?.networks,
      currentFolder?.storages,
      currentFolder?.virtual_machines,
    ],
  );

  const objects = useMemo(() => {
    const addNewChildrenToParentNode = (foldersNodeCollection: TreeNodeInfo[]): TreeNodeInfo[] =>
      foldersNodeCollection.map((node) => {
        const groupedResourcesSyntheticId = getProviderResourceTypeOfNodeId(node.id);

        const vmObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.VIRTUAL_MACHINE, true);
        const networkObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.NETWORK, true);
        const storagesObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.STORAGE, true);

        let selectedResources: number[] = [];
        let iconType: ComplexIconType = 'folder';
        let innerChildNodes: TreeNodeInfo[] = [];

        switch (groupedResourcesSyntheticId) {
          case PROVIDER_RESOURCE_TYPES_DIGITAL_ID.get(ProviderResourceType.VIRTUAL_MACHINE):
            selectedResources = selectedObjects.vm;
            innerChildNodes = vmObjects;
            iconType = ProviderResourceType.VIRTUAL_MACHINE;
            break;
          case PROVIDER_RESOURCE_TYPES_DIGITAL_ID.get(ProviderResourceType.NETWORK):
            selectedResources = selectedObjects.networks;
            iconType = ProviderResourceType.NETWORK;
            innerChildNodes = networkObjects;
            break;
          case PROVIDER_RESOURCE_TYPES_DIGITAL_ID.get(ProviderResourceType.STORAGE):
            selectedResources = selectedObjects.storages;
            iconType = ProviderResourceType.STORAGE;
            innerChildNodes = storagesObjects;
            break;
          default:
            break;
        }

        const isSelected =
          selectedFolders.includes(Number(node.id)) ||
          innerChildNodes.every((childNode) => selectedResources.includes(Number(childNode.id)));
        const icon = <ComplexIcon type={iconType} isChecked={isSelected} />;
        const isExpanded = expandedFolders.includes(Number(node.id));

        return {
          ...node,
          icon,
          isExpanded,
          isSelected,
          childNodes: innerChildNodes,
        };
      });
    return addNewChildrenToParentNode(nodesCollection);
  }, [
    nodesCollection,
    selectedObjects.networks,
    selectedObjects.storages,
    selectedObjects.vm,
    selectedFolders,
    expandedFolders,
    getNodesOutOfResources,
  ]);

  const folders = useMemo(() => {
    const networkObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.NETWORK, false);
    const storageObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.STORAGE, false);
    const vmObjects: TreeNodeInfo[] = getNodesOutOfResources(ProviderResourceType.VIRTUAL_MACHINE, false);

    const addNewChildrenToParentNode = (foldersNodeCollection: TreeNodeInfo[]): TreeNodeInfo[] =>
      foldersNodeCollection.map((node) => {
        const isSelected = selectedFolders.includes(Number(node.id));
        const isExpanded = expandedFolders.includes(Number(node.id));
        const childNodesList = [...childNodes, ...networkObjects, ...storageObjects, ...vmObjects];

        if (node.id === currentFolderId) {
          return {
            ...node,
            icon: <ComplexIcon type="folder" isChecked={isSelected} />,
            isExpanded,
            isSelected,
            childNodes: childNodesList,
          };
        }
        if (node.childNodes?.length) {
          return {
            ...node,
            icon: <ComplexIcon type="folder" isChecked={isSelected} />,
            isExpanded,
            isSelected,
            childNodes: addNewChildrenToParentNode(node.childNodes),
          };
        }
        if (typeof node.id === 'string') {
          const nodeClearId = Number(node.id.slice(0, -1));
          const iconSign = node.id.slice(-1);

          let isObjectSelected: boolean;
          let iconType: ComplexIconType;

          switch (iconSign) {
            case 'n':
              iconType = ProviderResourceType.NETWORK;
              isObjectSelected = selectedObjects.networks.includes(nodeClearId);
              break;
            case 's':
              iconType = ProviderResourceType.STORAGE;
              isObjectSelected = selectedObjects.storages.includes(nodeClearId);
              break;
            case 'v':
              iconType = ProviderResourceType.VIRTUAL_MACHINE;
              isObjectSelected = selectedObjects.vm.includes(nodeClearId);
              break;
            default:
              iconType = 'folder';
              isObjectSelected = false;
          }

          return {
            ...node,
            icon: <ComplexIcon type={iconType} isChecked={isObjectSelected} />,
            isSelected: isObjectSelected,
          };
        }
        return {
          ...node,
          icon: <ComplexIcon type="folder" isChecked={isSelected} />,
          isSelected,
          isExpanded,
        };
      });
    return addNewChildrenToParentNode(nodesCollection);
  }, [
    nodesCollection,
    selectedObjects.networks,
    selectedObjects.storages,
    selectedObjects.vm,
    selectedFolders,
    expandedFolders,
    currentFolderId,
    childNodes,
    getNodesOutOfResources,
  ]);
  return isGroupedObjectsView ? objects : folders;
};

/**
 *Hook which make list of all nodes to render in folders and objects tree element
 * @param formValuesState current state of selected folders and objects from react-hook-form
 * @param expandedFolders Array of expanded folders in tree
 * @param isGroupedObjectsView - flag that indicates that select form is in `Objects` state
 * @param search - Search value to filter nodes
 * @return list of nodes to render in folders and objects tree element
 */
export const useNodes = ({
  formValuesState,
  expandedFolders,
  isGroupedObjectsView,
  search,
}: UseNodesParams): TreeNodeInfo[] => {
  const nodesCollection = useNodesCollection(isGroupedObjectsView) || [];
  const storeChildFolders = useFolderChildList();
  const makeFolderNode = useMakeFolderNode();

  const childNodes = storeChildFolders ? makeFolderNode(storeChildFolders, formValuesState) : [];

  return useMakeNodeList({
    nodesCollection,
    childNodes,
    formValuesState,
    expandedFolders,
    isGroupedObjectsView,
    search,
  });
};

/**
 * Hook which create click handlers to folders and object tree element
 * @param formValue Values from react-hook-form field `folders_and_objects`
 * @param formOnChange Updater of value from react-hook-form
 * @param resultNodes Current node list. Use in case of expand new folder
 * @param setExpandedFolders Updater of expanded folders state
 * @param isGroupedObjectsView Flag that indicates should component displays objects by folders or in groups.
 * @return boolean value in case of param object type is {@link Folder}
 */
export const useHandlers = ({
  formValue,
  formOnChange,
  resultNodes,
  setExpandedFolders,
  isGroupedObjectsView,
}: UseHandlersParams): UseHandlersResult => {
  const dispatch = useDispatch();
  const providerId = useSelector(getProviderId);

  const checkContainsOfChildFieldObject = ({
    ChildFieldObjects,
    type,
    id,
    name,
  }: CheckContainsOfChildFieldObjectParams) => {
    let resultedObjects: ChildFieldObject[] = [...ChildFieldObjects];
    const isInCurrentItem = resultedObjects.find((object) => object.type === type && object.id === id);
    if (!isInCurrentItem) {
      resultedObjects.push({ id, type, name } as ChildFieldObject);
    } else {
      resultedObjects = resultedObjects.filter((object) => !(object.type === type && object.id === id));
    }
    return resultedObjects;
  };

  const handleNodeClick = React.useCallback(
    (node: TreeNodeInfo, nodePath: NodePath) => {
      const { nodeData } = node;

      const result: FieldFoldersAndObjects[] = [...(formValue || [])];
      const currentProviderIndex = result.findIndex((item) => item.provider_id === providerId);

      const resultedItem: FieldFoldersAndObjects =
        currentProviderIndex < 0
          ? ({ provider_id: providerId, folders: [], objects: [] } as FieldFoldersAndObjects)
          : result[currentProviderIndex];

      const getParentNodeData = (): Folder => Tree.nodeFromPath(nodePath.slice(0, -1), resultNodes).nodeData as Folder;
      if (isFolder(nodeData as Folder)) {
        const formFolder = resultedItem.folders.find((folder) => folder.id === Number(node.id));
        if (!formFolder) {
          resultedItem.folders.push({ id: Number(node.id), name: node.label.toString() });
          if (isGroupedObjectsView && node.childNodes) {
            node.childNodes.forEach((childNode) => {
              const nodeClearId = Number(childNode.id.toString().slice(0, -1));
              const name = typeof childNode.label === 'string' ? childNode.label : '';
              const iconSign = childNode.id.toString().slice(-1);

              let objectType: ComplexIconType;
              switch (iconSign) {
                case 'n':
                  objectType = ProviderResourceType.NETWORK;
                  break;
                case 's':
                  objectType = ProviderResourceType.STORAGE;
                  break;
                case 'v':
                default:
                  objectType = ProviderResourceType.VIRTUAL_MACHINE;
                  break;
              }
              resultedItem.objects.push({
                id: nodeClearId,
                name,
                type: objectType,
              });
            });
          }
        } else {
          resultedItem.folders = resultedItem.folders.filter((folder) => folder.id !== Number(node.id));
          if (isGroupedObjectsView && node.childNodes) {
            resultedItem.objects = resultedItem.objects.filter(
              (object) =>
                !node.childNodes?.find((childNode) => {
                  const nodeClearId = Number(childNode.id.toString().slice(0, -1));
                  return object.id === nodeClearId;
                }),
            );
          }
        }
      } else {
        // Обработка объектов
        const parentFolder = getParentNodeData();
        let currentType: ProviderResourceType;
        const nodeClearId = Number(node.id.toString().slice(0, -1));
        const nodeName = typeof node.label === 'string' ? node.label : '';

        if (
          parentFolder.networks.find((item) => item.id === nodeClearId && (item.name ? item.name === node.label : true))
        ) {
          currentType = ProviderResourceType.NETWORK;
          resultedItem.objects = checkContainsOfChildFieldObject({
            ChildFieldObjects: resultedItem.objects,
            type: currentType,
            id: Number(nodeClearId),
            name: nodeName,
          });
        }

        if (
          parentFolder.storages.find((item) => item.id === nodeClearId && (item.name ? item.name === node.label : true))
        ) {
          currentType = ProviderResourceType.STORAGE;
          resultedItem.objects = checkContainsOfChildFieldObject({
            ChildFieldObjects: resultedItem.objects,
            type: currentType,
            id: Number(nodeClearId),
            name: nodeName,
          });
        }

        if (
          parentFolder.virtual_machines.find(
            (item) => item.id === nodeClearId && (item.name ? item.name === node.label : true),
          )
        ) {
          currentType = ProviderResourceType.VIRTUAL_MACHINE;
          resultedItem.objects = checkContainsOfChildFieldObject({
            ChildFieldObjects: resultedItem.objects,
            type: currentType,
            id: Number(nodeClearId),
            name: nodeName,
          });
        }
      }

      if (currentProviderIndex < 0) {
        result.push(resultedItem);
      } else result[currentProviderIndex] = resultedItem;

      if (formOnChange && formValue) {
        formOnChange(result);
      }

      if (!isGroupedObjectsView) dispatch(setProviderNodesCollection(resultNodes));
    },
    [dispatch, formOnChange, formValue, providerId, resultNodes, isGroupedObjectsView],
  );

  const handleNodeCollapse = React.useCallback(
    (_node: TreeNodeInfo) => {
      setExpandedFolders((prevState) => prevState.filter((id) => id !== Number(_node.id)));
    },
    [setExpandedFolders],
  );

  const handleNodeExpand = React.useCallback(
    (_node: TreeNodeInfo) => {
      if (!isGroupedObjectsView) {
        dispatch(setProviderNodesCollection(resultNodes));
        dispatch(addChildFolders(Number(_node.id)));
      }
      setExpandedFolders((prevState) => [...prevState, Number(_node.id)]);
    },
    [dispatch, resultNodes, setExpandedFolders, isGroupedObjectsView],
  );

  return {
    handleNodeClick,
    handleNodeCollapse,
    handleNodeExpand,
  };
};
/**
 * Hook which earn value for current provider from form
 * @param formValue Values from react-hook-form field `folders_and_objects`
 * @return Arrays of selected folders and objects for current provider{@link Folder}
 */
export const useFormValuesState = (formValue?: FieldFoldersAndObjects[]): IFormValuesState => {
  const providerId = useSelector(getProviderId);

  if (!formValue) return { selectedFolders: [], selectedObjects: {} as ISelectedObjects };

  const currentProviderItem = formValue.find((item) => item.provider_id === providerId);
  const selectedFolders = currentProviderItem ? currentProviderItem.folders.map((folder) => folder.id) : [];
  const selectedObjects: ISelectedObjects = { networks: [], storages: [], vm: [] };

  if (currentProviderItem) {
    currentProviderItem.objects.forEach((object) => {
      // eslint-disable-next-line default-case
      switch (object.type) {
        case ProviderResourceType.NETWORK:
          selectedObjects.networks.push(object.id);
          break;
        case ProviderResourceType.STORAGE:
          selectedObjects.storages.push(object.id);
          break;
        case ProviderResourceType.VIRTUAL_MACHINE:
          selectedObjects.vm.push(object.id);
          break;
      }
    });
  }

  return {
    selectedFolders,
    selectedObjects,
  };
};

/**
 * Hook which create expand state and state updater to folders and object tree element
 * @return {expandedFolders, setExpandedFolders} state and updater of expanded folders ids
 */
export const useExpandFoldersState = (): {
  expandedFolders: number[];
  setExpandedFolders: React.Dispatch<React.SetStateAction<number[]>>;
} => {
  const expandedFoldersSelector = useCallback((state: State) => getExpandedFolders(state), []);
  const expandState = useSelector(expandedFoldersSelector) || [];
  const dispatch = useDispatch();

  const [expandedFolders, setExpandedFolders] = useState<number[]>(expandState);
  const onUnmount = useCallback(() => {
    dispatch(setStoreExpandedFolders(expandedFolders));
  }, [dispatch, expandedFolders]);

  useEffect(() => onUnmount, [onUnmount]);

  return {
    expandedFolders,
    setExpandedFolders,
  };
};

/** Hook which changes the native style of the container, if there is custom shadow root styles
 * @customStyles - flag that indicates that there is custom shadow root styles
 * @return container classname
 */
export const useShadowRootContainerClassName = (customStyles?: boolean): string =>
  classnames({
    [styles.selectContainer]: !customStyles,
  });

/** Hook which filters Nodes Tree in accordance to the search input
 * @params nodes - Tree of nodes to filter
 * @searcValue - value of search input
 * @return filtred nodes
 */
const useGetFilteredNodes = (nodes: TreeNodeInfo[], searchValue?: string): TreeNodeInfo[] => {
  if (!searchValue || searchValue === '') return nodes;

  const lowerCasedSearchValue = searchValue.toLowerCase() || '';

  const needToShow = (node: TreeNodeInfo, search?: string): boolean =>
    node.label.toString().toLowerCase().includes(lowerCasedSearchValue) ||
    (node.childNodes && node.childNodes.some((childNode) => needToShow(childNode, search))) ||
    false;

  const flatting = (node: TreeNodeInfo) => {
    const result = node;
    if (result.childNodes) result.childNodes = result.childNodes.flatMap(flatting);
    return needToShow(node, lowerCasedSearchValue) ? [node] : [];
  };

  return nodes.flatMap(flatting);
};

/**
 * Hook which earn value for current provider from form
 * @param - see {@link UseShadowRootFoldersObjectsTreeParams}
 * @return Tree nodes ReactElement
 */
export const useShadowRootFoldersObjectsTree = ({
  formOnChange,
  formValue,
  externalShadowRoot,
  isGroupedObjectsView,
  search,
}: UseShadowRootFoldersObjectsTreeParams): ReactElement => {
  const shadowRootStyles = useShadowRootStyles();
  const { expandedFolders, setExpandedFolders } = useExpandFoldersState();

  const formStateProps = useFormValuesState(formValue);
  const nodes = useNodes({ formValuesState: formStateProps, expandedFolders, isGroupedObjectsView, search });

  const blankNode = useBlankNode();
  const filteredNodes = useGetFilteredNodes(nodes, search);

  const contents = filteredNodes.length > 0 ? filteredNodes : blankNode;
  const { handleNodeExpand, handleNodeCollapse, handleNodeClick } = useHandlers({
    formValue,
    formOnChange,
    resultNodes: nodes,
    setExpandedFolders,
    isGroupedObjectsView,
  });
  const shadowRootContainerClassName = useShadowRootContainerClassName(!!externalShadowRoot);

  return (
    <root.div className={shadowRootContainerClassName}>
      {shadowRootStyles}
      {externalShadowRoot}
      <Tree
        contents={contents}
        onNodeClick={handleNodeClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
        className={Classes.ELEVATION_0}
      />
    </root.div>
  );
};

/** Hook which changes the native style of the Select container, if there is custom Select container styles
 * @customStyles - flag that indicates that there is custom Select container styles
 * @return Select container classname
 */
export const useSelectContainerClassName = (customStyles?: boolean): string =>
  classnames({
    [styles.selectContainer]: !customStyles,
  });
