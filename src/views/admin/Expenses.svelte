<script>
    import {purses, Purse} from "../../lib/purses";
    import { navigate } from "svelte-routing";
    export let purseTitle;

    let purse;
    $: purse = $purses.filter((p) => p.title === purseTitle)[0] || new Purse();

    let input = 0;
    let typeOfTransaction = "+";
    let incomes = 0;
    let outcomes = 0;
    let balance = 0;
    let deleted = false;
    let modalHidden = true;

    function validateInput(input){
        if(isNaN(input)){
            return false;
        }
        if(input.toString().startsWith("+") || input.toString().startsWith("-")){
            return false;
        }
        if(input.toString().startsWith("0.")) return true;
        if(input.toString().startsWith("0") ) return false;
        return true;
    }


    function handlerPlus() {
        if (!validateInput(input)) return;
        let date = Date.now();
        let now =new Date(date).toLocaleString();

        Purse.updatePurseByTitle(purseTitle, (purse) => {
            if (typeOfTransaction === "+") {
                // $tempStore[0].balance += +input;
                // purse.total.balance = +input;
                purse.total.balance += +input;
                purse.total.incomes += +input;
        
            } else {
                purse.total.balance -= +input;
                purse.total.outcomes += +input;
              
            }

            const expense = {
                typeOfTransaction,
                input,
                now,
                id:
                    purse.expenses.length > 0
                        ? purse.expenses[purse.expenses.length - 1].id + 1
                        : 1,
            };

            purse.expenses = [...purse.expenses, expense];

            purse.expenses.sort(function(a,b) {return b.now.localeCompare(a.now)});
        });
    }

    function deleteExpense(id) {

        for (let i = 0; i < purse.expenses.length; i++) {
            if (purse.expenses[i].id === id) {
                if(purse.expenses[i].typeOfTransaction === "+"){
                    purse.total.balance -= +purse.expenses[i].input;
                    purse.total.incomes -= +purse.expenses[i].input;
                } else {
                    purse.total.balance += +purse.expenses[i].input;
                    purse.total.outcomes -= +purse.expenses[i].input;
                }
                purse.expenses.splice(i, 1);
            }
        }

        Purse.updatePurseByTitle(purseTitle);
    }



    function deleteWallet(){
        Purse.deletePurseFromPurses(purseTitle);
        navi();
    }

    window.onload = () => {document.getElementById("input_expense")
        .addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.code === "Enter") {
                document.getElementById("button_expense").click();
            }
        });}



    function navi() {
        navigate("/admin/dashboard", { replace: true });
    }
    function compare(first,second){
        if (first.now > second.now){
            return second;
        } else return first;
    }

</script>

<div class="mb-24">
    <div id="id01" class="modal items-center md:ml-64" hidden={modalHidden} on:click={() => modalHidden=true}>
        <form class="modal-content">
            <div class="container">
                <h1 class="mb-6 text-2xl">Are you sure you want to delete this wallet?</h1>
                <div class="clearfix">
                    <button type="button" class="cancelbtn rounded-full" on:click={() => modalHidden=true}>Cancel</button>
                    <button type="button" class="deletebtn rounded-full" on:click={deleteWallet}>Delete</button>
                </div>
            </div>
        </form>
    </div>
    <div class="text-xl text-center flex-auto uppercase">
        Balance:
        <p id="balance" class="inline text-lightBlue-600">
            {purse.total.balance}
        </p>
    </div>
    <div class="text-center uppercase text-lg">
        <div class="inline">
            Incomes:
            <p id="incomes" class="inline text-teal-500">+{purse.total.incomes}
            </p>
        </div>
        <div class="inline px-2 md:">|</div>
        <div class="inline">
            Outcomes:
            <p id="outcomes" class="inline text-red-500">-{purse.total.outcomes}
            </p>
        </div>
    </div>
    <div class="flex flex-col p-2 py-6 ">
        <div
            class="bg-white items-center justify-between w-full flex rounded-full shadow-lg p-2 mb-5 "

        >
            <div class="p-2 mr-1 rounded-full hover:bg-gray-100">
                <span class="">
                    <select
                        id="select"
                        class="border-0 rounded-full"
                        bind:value={typeOfTransaction}
                    >
                        <option value="+">+</option>
                        <option value="-">-</option>
                    </select>
                </span>
            </div>

            <input
                bind:value={input}
                id="input_expense"
                class="font-bold uppercase rounded-full w-full py-4 pl-4 text-gray-700 bg-gray-100  lg:text-sm text-xs"
                type="text"
                placeholder="Value"
            />
            <button
                    id="button_expense"
                type="button"
                class="m-3 border-0 focus:outline-none"
                on:click={handlerPlus}
            >
                <img src="" class="imb mb-1 fas fa-plus" alt="" />
            </button>
        </div>
        <div class="grid grid-cols-2 text-xl uppercase ">
            <p class="m-4 font-bold">History <i class="fas fa-history"></i> </p>


                <div class="text-right text-white uppercase m-2 ">
                    <button type="button" class="bdl border border-red-500 bg-red-500 p-2 rounded-full shadow-md focus:outline-none  "
                            on:click={() => modalHidden = false}>
                        Delete wallet
                    </button>
                </div>



        </div>


        <div class="flex flex-col py-3 pb-16">
            <ul id="trans">
                {#each purse.expenses as expense}
                    <button type="button" class="m-0 focus:outline-none text-right inline far fa-times-circle hover:text-red-600" on:click={deleteExpense(expense.id)}></button>
                    <li class="border rounded-full p-2  {expense.typeOfTransaction ==='+' ? 'border-teal-500' : 'border-red-500'} ">
                        <div class="grid grid-cols-2 p-3">
                            <div class="pl-4 font-bold">{expense.typeOfTransaction}{expense.input}</div>
                            <div class="text-right font-normal">{expense.now}</div>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    </div>

</div>

<style>

    .imb:hover{
        transition-duration: 150ms;
        transform: scale(1.2);
    }
    .bdl:hover{
        transition-duration: 150ms;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
        transform: scale(1.05);
    }

    /* Float cancel and delete buttons and add an equal width */
    .cancelbtn{
        float:left;
        width: 25%;
        background-color: #4f9cc6;
        color: white;
        padding: 0.5rem;
    }
    .deletebtn {
        float: right;
        width: 25%;
        background-color: #f44336;
        color: white;
        padding: 0.5rem;
    }
    .cancelbtn:hover{
        float:left;
        width: 25%;
        background-color: #4f9cc6;
        color: white;
        padding: 0.5rem;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
        transition-duration: 150ms;
    }
    .deletebtn:hover {
        float: right;
        width: 25%;
        background-color: #f44336;
        color: white;
        padding: 0.5rem;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
        transition-duration: 150ms;
    }



    /* Add padding and center-align text to the container */
    .container {
        padding: 2rem;
        text-align: center;
    }

    /* The Modal (background) */
    .modal {
        position: fixed; /* Stay in place */
        top:0;
        left:0;
        width: 100%;
        height: 100%;
        z-index: 4;
        /*margin-left: 16rem;*/
        padding-left: 5rem;
        padding-right: 21rem;
        padding-top: 10rem;
        overflow: auto; /* Enable scroll if needed */
        background-color: rgba(122,122,122,0.6);
    }

    @media screen and (max-width: 768px) {
        .modal {
            position: fixed; /* Stay in place */
            top:0;
            left:0;
            width: 100%;
            height: 100%;
            padding-left: 3rem;
            padding-right: 3rem;
            padding-top: 15rem;
            overflow: auto; /* Enable scroll if needed */
            background-color: rgba(122,122,122,0.4);
        }
    }

    /* Modal Content/Box */
    .modal-content {
        background-color: #fefefe;
        width: auto;
        border-radius: 22px;
    }

    /* Clear floats */
    .clearfix::after {
        content: "";
        clear: both;
        display: table;
    }

    /* Change styles for cancel button and delete button on extra small screens */
    @media screen and (max-width: 300px) {
        .cancelbtn, .deletebtn {
            width: 100%;
        }
    }
</style>
