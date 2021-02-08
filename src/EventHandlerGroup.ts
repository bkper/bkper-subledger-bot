import { Book, Group } from "bkper";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerGroup extends EventHandler {

  protected async processObject(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {
    let childGroup = event.data.object as bkper.Group;

    const parentGroupName = childGroup.name;

    if (!parentGroupName) {
      return null;
    }

    let parentGroup = await parentBook.getGroup(parentGroupName);

    if (parentGroup == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      parentGroup = await parentBook.getGroup(event.data.previousAttributes['name']);
    }

    if (parentGroup) {
      return await this.parentGroupFound(childBook, parentBook, childGroup, parentGroup);
    } else {
      return await this.parentGroupNotFound(childBook, parentBook, childGroup);
    }
  }

  protected abstract parentGroupNotFound(childBook: Book, parentBook: Book, childGroup: bkper.Group): Promise<string>;

  protected abstract parentGroupFound(childBook: Book, parentBook: Book, childGroup: bkper.Group, parentGroup: Group): Promise<string>;

}