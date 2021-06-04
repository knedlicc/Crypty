
import {get} from 'svelte/store';
import {persistStore} from './localStore';

export const purses = persistStore('purses', []);

export class Total {
  /** @type {number} */
  incomes = 0;
  /** @type {number} */
  outcomes = 0;
  /** @type {number} */
  balance = 0;
}

export class Expense {
  id;
  now;
  input;
  typeOfTransaction;
}

export class Purse {

  /** @type {String} */
  title;

  /** @type {String} */
  currency;

  total = new Total();

  /** @type {Expense[]} */
  expenses = [];

  static deletePurseFromPurses(title,cbFn = (p) =>{}){
    purses.update(purses => {
      const updated = purses.filter(function(value,index,arr) {
        return value.title !== title;
      })
      return updated;
    })
  }

  static updatePurseByTitle(title, cbFn = (p) => {}) {
    purses.update(purses => {
      const purse = purses.filter(p => p.title === title)[0];
      if (purse) {
        cbFn(purse)
      }

      return purses;
    })
  }
}
//
// export function updatePurseByTitle(title, cbFn = (p) => {}) {
//   purses.update(purses => {
//     const purse = purses.filter(p => p.title === title)[0];
//     if (purse) {
//       cbFn(purse)
//     }
//
//     return purses;
//   })
// }
// export function deletePurseFromPurses(title,cbFn = (p) =>{}){
//   purses.update(purses => {
//     const updated = purses.filter(function(value,index,arr) {
//         return value.title !== title;
//     })
//     return updated;
//   })
// }

