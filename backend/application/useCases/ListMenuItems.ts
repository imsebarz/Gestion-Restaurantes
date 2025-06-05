import { MenuItem } from "../../domain/entities/MenuItem";
import { Connection, Cursor } from "../../domain/valueObjects/Pagination";
import {
  IMenuItemRepository,
  MenuItemFilter,
  MenuItemSort,
} from "../interfaces/IMenuItemRepository";

export interface ListMenuItemsRequest {
  filter?: MenuItemFilter;
  sort?: MenuItemSort;
  first?: number;
  after?: Cursor;
}

export class ListMenuItems {
  constructor(private readonly menuItemRepository: IMenuItemRepository) {}

  async execute(request: ListMenuItemsRequest): Promise<Connection<MenuItem>> {
    return this.menuItemRepository.findMany(
      request.filter,
      request.sort,
      request.first,
      request.after,
    );
  }
}
