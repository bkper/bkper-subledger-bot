import { Account, AccountType, Amount, Book, Group, Transaction } from "bkper";
import { PARENT_ACCOUNT_PROP } from "./constants";
import { EventHandler } from "./EventHandler";

export interface AmountDescription {
  amount: Amount;
  description: string;
  taxAmount: Amount;
}

export abstract class EventHandlerTransaction extends EventHandler {

  async processObject(childBook: Book, parentBook: Book, event: bkper.Event): Promise<string> {

    let operation = event.data.object as bkper.TransactionOperation;
    let childTransaction = operation.transaction;

    if (!childTransaction.posted) {
      return null;
    }

    let iterator = parentBook.getTransactions(this.getTransactionQuery(childTransaction));
    if (await iterator.hasNext()) {
      let parentTransaction = await iterator.next();
      return this.connectedTransactionFound(childBook, parentBook, childTransaction, parentTransaction);
    } else {
      return this.connectedTransactionNotFound(childBook, parentBook, childTransaction)
    }
  }

  protected async getParentAccount(parentBook: Book, childAccount: Account): Promise<Account> {

      let parentAccountName = childAccount.getProperty(PARENT_ACCOUNT_PROP);
      if (parentAccountName) {
        let parentAccount = await parentBook.getAccount(parentAccountName);
        if (parentAccount == null) {
          try {
            parentAccount = await parentBook.newAccount()
            .setName(parentAccountName)
            .setType(childAccount.getType())
            .create()
          } catch (err) {
            console.log(err)
            return null;
          }
        }
        return parentAccount;
      }

    const childGroups = await childAccount.getGroups();
    for (const childGroup of childGroups) {
      let parentAccountName = childGroup.getProperty(PARENT_ACCOUNT_PROP);
      if (parentAccountName) {
        let parentAccount = await parentBook.getAccount(parentAccountName);
        if (parentAccount == null) {
          try {
            parentAccount = await parentBook.newAccount()
            .setName(parentAccountName)
            .setType(await this.getGroupAccountType(childGroup))
            .create()
          } catch (err) {
            console.log(err)
            return null;
          }
        }
        return parentAccount;
      }
    }
    return null;
  } 

  protected isReadyToPost(newTransaction: Transaction) {
    return newTransaction.getCreditAccount() != null && newTransaction.getDebitAccount() != null && newTransaction.getAmount() != null;
  }

  protected abstract getTransactionQuery(childTransaction: bkper.Transaction): string;

  protected abstract connectedTransactionNotFound(childBook: Book, parentBook: Book, childTransaction: bkper.Transaction): Promise<string>;

  protected abstract connectedTransactionFound(childBook: Book, parentBook: Book, chilTransaction: bkper.Transaction, parentTransaction: Transaction): Promise<string>;
}