import { Account, Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionUpdated extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected connectedTransactionNotFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async connectedTransactionFound(baseBook: Book, connectedBook: Book, baseTransaction: bkper.Transaction, connectedTransaction: Transaction): Promise<string> {
    let childCreditAccount = await baseBook.getAccount(baseTransaction.creditAccount.id);
    let childDebitAccount = await baseBook.getAccount(baseTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(connectedBook);

    let parentCreditAccount = await this.getParentAccount(connectedBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(connectedBook, childDebitAccount);

    if (parentCreditAccount == null || parentDebitAccount == null) {
      return null;
    }

    await this.updateParentTransaction(connectedBook, connectedTransaction, baseTransaction, parentCreditAccount, parentDebitAccount);

    let amountFormatted = connectedBook.formatValue(connectedTransaction.getAmount())

    let record = `EDITED: ${connectedTransaction.getDateFormatted()} ${amountFormatted} ${await connectedTransaction.getCreditAccountName()} ${await connectedTransaction.getDebitAccountName()} ${connectedTransaction.getDescription()}`;

    return `${parentBookAnchor}: ${record}`;
  }



  private async updateParentTransaction(connectedBook: Book, connectedTransaction: Transaction, baseTransaction: bkper.Transaction, connectedCreditAccount: Account, connectedDebitAccount: Account) {
    if (connectedTransaction.isChecked()) {
      await connectedTransaction.uncheck();
    }

    connectedTransaction
      .setDate(baseTransaction.date)
      .setProperties(baseTransaction.properties)
      .setAmount(baseTransaction.amount)
      .setCreditAccount(connectedCreditAccount)
      .setDebitAccount(connectedDebitAccount)
      .setDescription(baseTransaction.description)
      .addRemoteId(baseTransaction.id);


    let urls = baseTransaction.urls;
    if (!urls) {
      urls = [];
    }

    if (baseTransaction.urls) {
      urls = baseTransaction.urls;
    }

    if (baseTransaction.files) {
      baseTransaction.files.forEach(file => {
        urls.push(file.url);
      });
    }

    connectedTransaction.setUrls(urls);

    await connectedTransaction.update();
  }



}

