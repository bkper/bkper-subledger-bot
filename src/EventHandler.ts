import { AccountType, Bkper, Book, Group } from "bkper";
import { PARENT_BOOK_ID_PROP } from "./constants";

export abstract class EventHandler {

  protected abstract processObject(baseBook: Book, connectedBook: Book, event: bkper.Event): Promise<string>;

  async handleEvent(event: bkper.Event): Promise<string | boolean> {
    let bookId = event.bookId;
    let baseBook = await Bkper.getBook(bookId);
    let connectedBookId = baseBook.getProperty(PARENT_BOOK_ID_PROP, 'parent_book');

    let connectedBook = null;
    if (connectedBookId) {
      connectedBook = await Bkper.getBook(connectedBookId);
    }
    let response = await this.processObject(baseBook, connectedBook, event);
    if (response == null || response == '') {
      return false;
    }
    return response;
  }

  protected buildBookAnchor(book: Book) {
    return `<a href='https://app.bkper.com/b/#transactions:bookId=${book.getId()}'>${book.getName()}</a>`;
  }

}