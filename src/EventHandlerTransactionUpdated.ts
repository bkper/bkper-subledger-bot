import { Account, Book, Transaction } from "bkper";
import { CHILD_FROM_PROP, CHILD_TO_PROP } from "./constants";
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

    let parentCreditAccount = await this.getParentAccount(childBook, parentBook, childCreditAccount);
    let parentDebitAccount = await this.getParentAccount(childBook, parentBook, childDebitAccount);

    if (parentCreditAccount == null || parentDebitAccount == null) {
      return null;
    }

    await this.updateParentTransaction(childBook, parentBook, childTransaction, parentTransaction, parentCreditAccount, parentDebitAccount);

    let amountFormatted = parentBook.formatValue(parentTransaction.getAmount())

    let record = `EDITED: ${parentTransaction.getDateFormatted()} ${amountFormatted} ${await parentTransaction.getCreditAccountName()} ${await parentTransaction.getDebitAccountName()} ${parentTransaction.getDescription()}`;

    return `${parentBookAnchor}: ${record}`;
  }



  private async updateParentTransaction(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction, parentTransaction: Transaction, parentCreditAccount: Account, parentDebitAccount: Account) {

    let childCreditAccount = await childBook.getAccount(childTransaction.creditAccount.id);
    let childDebitAccount = await childBook.getAccount(childTransaction.debitAccount.id);

    if (parentTransaction.isChecked()) {
      await parentTransaction.uncheck();
    }

    parentTransaction
      .setDate(childTransaction.date)
      .setProperties(childTransaction.properties)
      .setProperty(CHILD_FROM_PROP, childCreditAccount.getName())
      .setProperty(CHILD_TO_PROP, childDebitAccount.getName())      
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

