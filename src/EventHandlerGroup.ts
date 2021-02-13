import { Bkper, Book, Group } from "bkper";
import { CHILD_BOOK_ID_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerGroup extends EventHandler {

  protected async processChildBookEvent(parentBook: Book, childBook: Book, event: bkper.Event): Promise<string> {
    return null;
  }

  async processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string> {

    let parentGroup = event.data.object as bkper.Group;

    let childBook = await this.getConnectedBook(parentBook, parentGroup);

    if (childBook == null) {
      return null;
    }

    let childGroup = await childBook.getGroup(parentGroup.name);

    if (childGroup == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      childGroup = await childBook.getGroup(event.data.previousAttributes['name']);
    }

    if (childGroup) {
      return await this.childGroupFound(parentBook, childBook, parentGroup, childGroup);
    } else {
      return await this.childGroupNotFound(parentBook, childBook, parentGroup);
    }
  }


  private async getConnectedBook(baseBook: Book, group: bkper.Group): Promise<Book> {
    if (group.properties[CHILD_BOOK_ID_PROP]) {
      return Bkper.getBook(group.properties[CHILD_BOOK_ID_PROP]);
    }
    return null;
  }

  protected abstract childGroupNotFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group): Promise<string>;

  protected abstract childGroupFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group, connectedGroup: Group): Promise<string>;

}