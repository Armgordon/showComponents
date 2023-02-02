import type { ChildFieldObject, FieldFoldersAndObjects, ProviderResourceType } from '@domain';
import type { TreeNodeInfo } from '@blueprintjs/core';
import type React from 'react';

/* eslint-disable camelcase */

/** `FoldersObjectsTree` component properties */
export interface Props {
  /** Additional CSS class */
  className?: string;
  /** Selected provider type */
  formValue?: FieldFoldersAndObjects[];
  /** On provider type select */
  formOnChange(value?: FieldFoldersAndObjects[]): unknown;
  /** External styles in <style> */
  externalShadowRoot?: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>;
  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
  /** Search value to filter nodes */
  search?: string;
}

/** Current item from react-hook-form */
export interface IFormValuesState {
  /** Array of selected folders of current provider */
  selectedFolders: number[];
  /** Array of selected objects of current provider */
  selectedObjects: ISelectedObjects;
}

export interface ISelectedObjects {
  /** Array of selected networks objects */
  networks: number[];
  /** Array of selected storages objects */
  storages: number[];
  /** Array of selected vm objects */
  vm: number[];
}

export type NodePath = number[];

/** `useHandlers` hook params */
export interface UseHandlersParams {
  /** Array of selected folders and objects values from react-hook-form */
  formValue?: FieldFoldersAndObjects[];
  /** Updater value from react-hook-form */
  formOnChange: (value?: FieldFoldersAndObjects[]) => unknown;
  /** List of current tree nodes */
  resultNodes: TreeNodeInfo[];
  /** Updater of expanded folders state */
  setExpandedFolders: React.Dispatch<React.SetStateAction<number[]>>;
  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
}

/** `useHandlers` hook result */
export interface UseHandlersResult {
  /** Handler on click node in tree */
  handleNodeClick: (node: TreeNodeInfo, nodePath: NodePath) => void;
  /** Handler on click collapse chevron in tree */
  handleNodeCollapse: (_node: TreeNodeInfo, nodePath: NodePath) => void;
  /** Handler on click expand chevron in tree */
  handleNodeExpand: (_node: TreeNodeInfo) => void;
}

/** `useMakeNodeList` hook params */
export interface UseMakeNodeListParams {
  /** Current list of tree nodes */
  nodesCollection: TreeNodeInfo[];
  /** Current list of child nodes */
  childNodes: TreeNodeInfo[];
  /** Form state from react-hook-form */
  formValuesState: IFormValuesState;
  /** List of expanded folders IDs */
  expandedFolders: number[];
  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
  /** Search value to filter nodes */
  search?: string;
}

/** `useObjectsList` hook params */
export interface UseObjectsListParams {
  /** Current list of tree nodes */
  nodesCollection: TreeNodeInfo[];
  /** Form state from react-hook-form */
  formValuesState: IFormValuesState;
  /** List of expanded folders IDs */
  expandedFolders: number[];
}

/** `useShadowRootFoldersObjectsTree` hook params  */
export interface UseShadowRootFoldersObjectsTreeParams {
  /** Selected folders and objects */
  formValue?: FieldFoldersAndObjects[];
  /** On folders and objects select */
  formOnChange(value?: FieldFoldersAndObjects[]): unknown;
  /** External styles in <style> */
  externalShadowRoot?: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>;
  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
  /** Search value to filter nodes */
  search?: string;
}

/** `useNodes` hook params  */
export interface UseNodesParams {
  /** Current state of selected folders and objects from react-hook-form */
  formValuesState: IFormValuesState;
  /** Array of expanded folders in tree */
  expandedFolders: number[];
  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
  /** Search value to filter nodes */
  search?: string;
}

/** `checkContainsOfChildFieldObject` function params */
export interface CheckContainsOfChildFieldObjectParams {
  /** Selected objects from react-hook-form field `folders_and_objects` */
  ChildFieldObjects: ChildFieldObject[];
  /** Object type */
  type: ProviderResourceType;
  /** Object id */
  id: number;
  /** Object name */
  name: string;
}
