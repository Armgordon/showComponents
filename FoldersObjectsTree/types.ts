import type { FieldFoldersAndObjects, Folder } from '@domain';
import type { TreeLikeCursorFactory } from '@utils';

/** `FoldersObjectsTree` component properties */
export interface Props {
  providerId: number;
  /** Additional CSS class */
  className?: string;
  /** Selected provider type */
  formValue: FieldFoldersAndObjects[];

  /** On provider type select */
  formOnChange(value: FieldFoldersAndObjects[]): unknown;

  /** Flag that indicates should component displays objects in groups. */
  isGroupedObjectsView?: boolean;
  /** Search value to filter nodes */
  search?: string;
}

/** useFolderMatchSearch function params */
export interface UseFolderMatchSearchParams {
  /** Search value */
  search?: string;
  /** Factory function which creates child getter for folder */
  foldersFactory: TreeLikeCursorFactory<Folder>;
}
