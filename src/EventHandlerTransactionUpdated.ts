import { Account, Book, Transaction } from "bkper";
import { EventHandlerTransaction } from "./EventHandlerTransaction";

export class EventHandlerTransactionUpdated extends EventHandlerTransaction {

  protected getTransactionQuery(transaction: bkper.Transaction): string {
    return `remoteId:${transaction.id}`;
  }

  protected parentTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string> {
    return null;
  }
  protected async parentTransactionFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string> {
    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);
    let parentBookAnchor = super.buildBookAnchor(parentBook);

    let parentCreditAccount = await this.getParentAccount(parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(parentBook, childDebitAccount);

    if (parentCreditAccount == null || parentDebitAccount == null) {
      return null;
    }

    await this.updateParentTransaction(parentBook, parentTransaction, childTransaction, parentCreditAccount, parentDebitAccount);

    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount())

    let record = `EDITED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;

    return `${parentBookAnchor}: ${record}`;
  }



  private async updateParentTransaction(childBook: Book, parentTransaction: Transaction, childTransaction: bkper.Transaction, parentCreditAccount: Account, parentDebitAccount: Account) {
    if (parentTransaction.isChecked()) {
      await parentTransaction.uncheck();
    }

    parentTransaction
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setAmount(childTransaction.amount)
      .setCreditAccount(parentCreditAccount)
      .setDebitAccount(parentDebitAccount)
      .setDescription(childTransaction.description)
      .addRemoteId(childTransaction.id);


    let urls = childTransaction.urls;
    if (!urls) {
      urls = [];
    }

    if (childTransaction.urls) {
      urls = childTransaction.urls;
    }

    if (childTransaction.files) {
      childTransaction.files.forEach(file => {
        urls.push(file.url);
      });
    }

    parentTransaction.setUrls(urls);

    await parentTransaction.update();
  }



}

