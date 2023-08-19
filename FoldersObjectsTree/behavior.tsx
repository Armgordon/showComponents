import { useCallback } from 'react';
import type { FieldFoldersAndObjects, ChildFieldObject, ChildFieldFolder, Folder, AttachedResource } from '@domain';
import { useInitialSelectedFoldersState, useProviderResources } from '@components/common/customHooks';
import { useResourceTypeByIdPostfix } from '@components/serviceDiscovery/ProviderPage/utils';
import { useClearTreeNodeIdentifier, useGetOptionId } from '@components/common/objectTrees/customTreeHooks';
import { getResourceTypeArg } from '@components/common/ModalManager/utils';
import { checkFolderContainsResource } from '@components/common/utils/resources';
import type { UseFolderMatchSearchParams } from '@components/common/objectTrees/FoldersObjectsTree/types';
import type { SelectedState } from '../types';

/**
 * Hook to get index of current provider in formValue {@link FieldFoldersAndObjects}
 * @param formValue value of the selecting folders and objects form
 * @param providerId - ID of current provider
 * @returns index of current provider in the form, or `-1`, if current provider is not in the form
 */
const useGetCurrentProviderFormValueIndex = (formValue: FieldFoldersAndObjects[], providerId: number): number =>
  formValue.findIndex((value) => value.provider_id === providerId);

/**
 * Hook to get object of {@link FieldFoldersAndObjects} related to current provider
 * @param providerId - ID of current provider
 *
 * Params of returned callback:
 * @param folders - array of selected folders {@link ChildFieldFolder}[]
 * @param objects - array of selected resources {@link ChildFieldObject}[]
 * @returns object of {@link FieldFoldersAndObjects} related to current provider
 */
const useGetEmptyProviderFormValue = (
  providerId: number,
): (({ folders, objects }: { folders?: ChildFieldFolder[]; objects?: ChildFieldObject[] }) => FieldFoldersAndObjects) =>
  useCallback(
    ({ folders, objects }: { folders?: ChildFieldFolder[]; objects?: ChildFieldObject[] }) => ({
      provider_id: providerId,
      folders: folders ?? [],
      objects: objects ?? [],
    }),
    [providerId],
  );

/**
 * Hook to get selected folders and objects in provider
 * @param formValue value of the selecting folders and objects form
 * @param providerId - ID of current provider
 * @returns - see {@link SelectedState}
 */
export const useInitialSelectedFoldersObjects = (
  formValue: FieldFoldersAndObjects[],
  providerId: number,
): SelectedState => {
  const indexOfCurrentProviderFormValue = useGetCurrentProviderFormValueIndex(formValue, providerId);
  const emptyProviderFormValueGetter = useGetEmptyProviderFormValue(providerId);

  const selectedState = formValue[indexOfCurrentProviderFormValue] ?? emptyProviderFormValueGetter({});

  return useInitialSelectedFoldersState(selectedState);
};

/**
 * Hook returns callback for selecting folder
 * @param formValue value of the selecting folders and objects form
 * @param formOnChange handler for setting new set of selected folders
 * @param providerId - ID of current provider
 */
export const useSelectFolder = (
  formValue: FieldFoldersAndObjects[],
  formOnChange: (value: FieldFoldersAndObjects[]) => unknown,
  providerId: number,
): ((id: string) => void) => {
  const parseTreeNodeId = useClearTreeNodeIdentifier();
  const indexOfCurrentProviderFormValue = useGetCurrentProviderFormValueIndex(formValue, providerId);
  const emptyProviderFormValueGetter = useGetEmptyProviderFormValue(providerId);
  const selectedFolders = useInitialSelectedFoldersObjects(formValue, providerId).folders;

  return useCallback(
    (id: string) => {
      const newFormValue = [...formValue];
      const formContainsCurrentProvider = indexOfCurrentProviderFormValue !== -1;

      const newSelectedFolders = selectedFolders.has(id) ? selectedFolders.delete(id) : selectedFolders.add(id);
      const resultFolders = newSelectedFolders.toArray().map((item) => ({
        id: parseTreeNodeId(item),
        providerId,
      }));

      if (formContainsCurrentProvider) {
        newFormValue[indexOfCurrentProviderFormValue] = {
          ...newFormValue[indexOfCurrentProviderFormValue],
          folders: resultFolders,
        };
      } else {
        const selectedState = emptyProviderFormValueGetter({ folders: resultFolders });
        newFormValue.push(selectedState);
      }

      formOnChange(newFormValue);
    },
    [
      providerId,
      emptyProviderFormValueGetter,
      formOnChange,
      formValue,
      indexOfCurrentProviderFormValue,
      parseTreeNodeId,
      selectedFolders,
    ],
  );
};

/**
 * Hook returns callback for selecting resource
 * @param formValue value of the selecting folders and objects form
 * @param formOnChange handler for setting new set of selected resources
 * @param providerId - ID of current provider
 */
export const useSelectedResourcesState = (
  formValue: FieldFoldersAndObjects[],
  formOnChange: (value: FieldFoldersAndObjects[]) => unknown,
  providerId: number,
): ((id: string) => void) => {
  const parseTreeNodeId = useClearTreeNodeIdentifier();
  const indexOfCurrentProviderFormValue = useGetCurrentProviderFormValueIndex(formValue, providerId);
  const getResourceType = useResourceTypeByIdPostfix();
  const selectedResources = useInitialSelectedFoldersObjects(formValue, providerId).resources;
  const emptyProviderFormValueGetter = useGetEmptyProviderFormValue(providerId);

  const toggleSelectOption = useCallback(
    (id: string) => {
      const newFormValue = [...formValue];
      const formContainsCurrentProvider = indexOfCurrentProviderFormValue !== -1;

      const newSelectedResources = selectedResources.has(id) ? selectedResources.delete(id) : selectedResources.add(id);
      const resultResources = newSelectedResources.toArray().map((item) => ({
        id: parseTreeNodeId(item),
        type: getResourceType(item),
        providerId,
      }));

      if (formContainsCurrentProvider) {
        newFormValue[indexOfCurrentProviderFormValue] = {
          ...newFormValue[indexOfCurrentProviderFormValue],
          objects: resultResources,
        };
      } else {
        const selectedState = emptyProviderFormValueGetter({ objects: resultResources });
        newFormValue.push(selectedState);
      }

      formOnChange(newFormValue);
    },
    [
      providerId,
      formValue,
      indexOfCurrentProviderFormValue,
      selectedResources,
      formOnChange,
      parseTreeNodeId,
      getResourceType,
      emptyProviderFormValueGetter,
    ],
  );

  return toggleSelectOption;
};

/**
 * Hook returns callback for selecting grouped resources
 * @param formValue value of the selecting folders and objects form
 * @param formOnChange handler for setting new set of selected resources
 * @param providerId - ID of current provider
 */
export const useSelectedGroupedResourceState = (
  formValue: FieldFoldersAndObjects[],
  formOnChange: (value: FieldFoldersAndObjects[]) => unknown,
  providerId: number,
): ((id: string) => void) => {
  const resources = useProviderResources(providerId);
  const indexOfCurrentProviderFormValue = useGetCurrentProviderFormValueIndex(formValue, providerId);
  const selectedResources = useInitialSelectedFoldersObjects(formValue, providerId).resources;
  const emptyProviderFormValueGetter = useGetEmptyProviderFormValue(providerId);
  const getOptionId = useGetOptionId();

  const toggleSelectOption = useCallback(
    (groupedResourceType: string) => {
      const newFormValue = [...formValue];
      const formContainsCurrentProvider = indexOfCurrentProviderFormValue !== -1;

      const resourceType = getResourceTypeArg(groupedResourceType);
      const childResources = resources[resourceType];

      const allResourcesAreSelected = childResources.every((resource) => {
        const idOfChildResource = getOptionId(resource, resourceType);
        return selectedResources.has(idOfChildResource);
      });

      const resultResources = childResources.map((resource) => ({
        ...resource,
        id: Number(resource.id),
        providerId,
      }));

      if (formContainsCurrentProvider) {
        const previousSelectedObjects = newFormValue[indexOfCurrentProviderFormValue].objects;
        const newSelectedObjects = allResourcesAreSelected
          ? previousSelectedObjects.filter(
              (oldObject) => !resultResources.some((newObject) => newObject.id === oldObject.id),
            )
          : [...previousSelectedObjects, ...resultResources];

        newFormValue[indexOfCurrentProviderFormValue] = {
          ...newFormValue[indexOfCurrentProviderFormValue],
          objects: newSelectedObjects,
        };
      } else {
        const selectedState = emptyProviderFormValueGetter({ objects: resultResources });
        newFormValue.push(selectedState);
      }
      formOnChange(newFormValue);
    },
    [
      providerId,
      emptyProviderFormValueGetter,
      formOnChange,
      formValue,
      getOptionId,
      indexOfCurrentProviderFormValue,
      resources,
      selectedResources,
    ],
  );

  return toggleSelectOption;
};

/**
 * Hook for getting callback to filter folders which match search value
 * @param search - value of the search
 * @param foldersFactory Factory function which creates child getter for folder
 */
export const useFolderMatchSearch = ({
  search,
  foldersFactory,
}: UseFolderMatchSearchParams): ((folder: Folder) => boolean) => {
  const filterCallback = useCallback(
    (folder: Folder): boolean => {
      if (!search) return true;

      if (folder.name.toLowerCase().includes(search.toLowerCase())) return true;
      if (checkFolderContainsResource(folder, search.toLowerCase())) return true;

      const value = foldersFactory(folder);

      return value.toChildren().some((childFolderCursor) => filterCallback(childFolderCursor.value));
    },
    [foldersFactory, search],
  );

  return filterCallback;
};

/**
 * Hook for getting callback to filter resources which match search value
 * @param search - value of the search
 */
export const useFilterResourcesCallback = (search?: string): ((resource: AttachedResource) => boolean) =>
  useCallback(
    (resource: AttachedResource) => {
      if (!search) return true;
      return resource.name.toLowerCase().includes(search?.toLowerCase());
    },
    [search],
  );
