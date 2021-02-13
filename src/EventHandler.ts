import { AccountType, Bkper, Book, Group } from "bkper";
import { PARENT_BOOK_ID_PROP } from "./constants";

export abstract class EventHandler {

  protected abstract processChildBookEvent(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string>;
  protected abstract processParentBookEvent(parentBook: Book, event: bkper.Event): Promise<string>;

  async handleEvent(event: bkper.Event): Promise<string | boolean> {
    let bookId = event.bookId;
    let baseBook = await Bkper.getBook(bookId);
    let connectedBookId = baseBook.getProperty(PARENT_BOOK_ID_PROP, 'parent_book');

    let connectedBook = null;
    let response = null;
    if (connectedBookId) {
      connectedBook = await Bkper.getBook(connectedBookId);
      response = await this.processChildBookEvent(baseBook, connectedBook, event);
    } else {
      response = await this.processParentBookEvent(baseBook, event);
    }
    if (response == null || response == '') {
      return false;
    }
    return response;
  }

  protected buildBookAnchor(book: Book) {
    return `<a href='https://app.bkper.com/b/#transactions:bookId=${book.getId()}'>${book.getName()}</a>`;
  }

}