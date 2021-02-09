import { Bkper, Book, Group } from "bkper";
import { CHILD_BOOK_ID_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export abstract class EventHandlerGroup extends EventHandler {

  protected async processObject(baseBook: Book, connectedBook: Book, event: bkper.Event): Promise<string> {

    let baseGroup = event.data.object as bkper.Group;

    if (connectedBook == null) {
      connectedBook = await this.getConnectedBook(baseBook, baseGroup);
    }

    if (connectedBook == null) {
      return null;
    }

    let connectedGroup = await connectedBook.getGroup(baseGroup.name);

    if (connectedGroup == null && (event.data.previousAttributes && event.data.previousAttributes['name'])) {
      connectedGroup = await connectedBook.getGroup(event.data.previousAttributes['name']);
    }

    if (connectedGroup) {
      return await this.connectedGroupFound(baseBook, connectedBook, baseGroup, connectedGroup);
    } else {
      return await this.connectedGroupNotFound(baseBook, connectedBook, baseGroup);
    }
  }


  private async getConnectedBook(baseBook: Book, group: bkper.Group): Promise<Book> {
    if (group.properties[CHILD_BOOK_ID_PROP]) {
      return Bkper.getBook(group.properties[CHILD_BOOK_ID_PROP]);
    }
    return null;
  }

  protected abstract connectedGroupNotFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group): Promise<string>;

  protected abstract connectedGroupFound(baseBook: Book, connectedBook: Book, baseGroup: bkper.Group, connectedGroup: Group): Promise<string>;

}