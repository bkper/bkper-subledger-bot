import { Account, AccountType, Amount, Book, Group, Transaction } from "bkper";
import { EventHandler } from "./EventHandler";

export interface AmountDescription {
  amount: Amount;
  description: string;
  taxAmount: Amount;
}

export abstract class EventHandlerTransaction extends EventHandler {

  async processObject(baseBook: Book, connectedBook: Book, event: bkper.Event): Promise<string> {

    let operation = event.data.object as bkper.TransactionOperation;
    let baseTransaction = operation.transaction;

    if (!baseTransaction.posted) {
      return null;
    }

    let iterator = connectedBook.getTransactions(this.getTransactionQuery(baseTransaction));
    if (await iterator.hasNext()) {
      let connectedTransaction = await iterator.next();
      return this.connectedTransactionFound(baseBook, connectedBook, baseTransaction, connectedTransaction);
    } else {
      return this.connectedTransactionNotFound(baseBook, connectedBook, baseTransaction)
    }
  }

  protected async getParentAccount(parentBook: Book, baseAccount: Account): Promise<Account> {
    let connectedAccountName = baseAccount.getName();
      let parentAccount = await parentBook.getAccount(connectedAccountName);
      if (parentAccount == null) {
        try {
          parentAccount = await parentBook.newAccount()
          .setName(connectedAccountName)
          .setType(baseAccount.getType())
          .create()
        } catch (err) {
          console.log(err)
          return null;
        }
      }
      return parentAccount;
  } 

  protected async isReadyToPost(newTransaction: Transaction) {
    return await newTransaction.getCreditAccount() != null && await newTransaction.getDebitAccount() != null && newTransaction.getAmount() != null;
  }

  protected abstract getTransactionQuery(childTransaction: bkper.Transaction): string;

  protected abstract connectedTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string>;

  protected abstract connectedTransactionFound(childBook: Book, parentBook: Book, chilTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string>;
}