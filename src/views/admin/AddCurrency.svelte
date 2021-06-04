<script>
  import { purses, Purse, Total } from "../../lib/purses";
  import {navigate} from "svelte-routing";

  export let location;

  let title;
  let currency;
  let balance;
  let modalHidden = true;

  function validateInput(input){
    for(let i =0; i<$purses.length;i++){
      if($purses[i].title === input){
        modalHidden = false;
        console.log("purses.title match");
        return false;
      }
    }
    // if(isNaN(input)){
    //   console.log("NAN")
    //   return false;
    // }
    if(input.toString().startsWith("+") || input.toString().startsWith("-")){
      return false;
    }
    return true;
  }

  function addPurse() {
    if(!title || !currency || !balance ){
      return;
    }
    if(balance.isNaN) return;
    if(!validateInput(title)) return;
    const purse = new Purse();
    purse.title = title;
    purse.currency = currency;

    purse.total = new Total();
    purse.total.balance = +balance;

    $purses = [...$purses, purse];
    navi()
    title = "";
    currency = "";
    balance = "";

  }

  function navi() {
    navigate("/admin/purse/"+title, { replace: true });
  }

</script>

<div class="">
  <div id="id01" class="modal items-center md:ml-64" hidden={modalHidden} on:click={() => modalHidden=true}>
    <form class="modal-content">
      <div class="container">
        <h1 class="mb-6 text-2xl">Wallet with this name already exists</h1>
        <div class="clearfix">
          <button type="button" class="cancelbtn rounded-full" on:click={() => modalHidden=true}>Ok</button>
        </div>
      </div>
    </form>
  </div>
<div class="flex justify-center sm:pt-12">
  <div class="sm:max-w-xl sm:mx-auto">
    <div class="bg-white md:mx-0 shadow sm:p-10 p-8 mb-24">
      <form on:submit|preventDefault={addPurse}>
        <div class="flex items-center">
          <div
            class="block pl-2 font-semibold text-xl self-start text-gray-700"
          >
            <h2 class="leading-relaxed">Create a wallet</h2>
            <p class="text-sm text-gray-500 font-normal leading-relaxed">
              Choose name, type of currency and initial balance.
            </p>
          </div>
        </div>

        <div class="">
          <div
            class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"
          >
            <div class="flex flex-col pb-4">
              <label class="leading-loose">Wallet title</label>
              <input
                type="text"
                bind:value={title}
                class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                placeholder="Currency name"
                required
              />
            </div>

            <div class="flex flex-col pb-4">
              <label>Type of currency</label>
              <select
                bind:value={currency}
                class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
              >
                <option value="crypto">Crypto</option>
                <option value="regular">Regular</option>
              </select>
            </div>

            <div class="flex flex-col">
              <label class="leading-loose">Initial balance</label>
              <input
                bind:value={balance}
                type="text"
                class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div class="flex-col flex text-right focus:outline-none">
            <button
                    id="createBtn"
              class="text-teal-500 hover:text-white hover:bg-teal-500 border border-solid border-teal-500 focus:outline-none font-bold uppercase text-xs px-4 py-2 rounded-full outline-none ease-linear"
              type="submit">

<!--              onmouseover="this.style = 'background-color: teal;' +-->
<!--                         'color:white'"-->
<!--              onmouseout="this.style ='background-color: white;' +-->
<!--                          'color:#008080;'+'border-color:#008080'"-->

              Create <i class="fas fa-angle-right"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
</div>

<style>
  button:hover {
    background-color: teal;
    color: white;
  }

  /* Float cancel and delete buttons and add an equal width */
  .cancelbtn{

    width: 25%;
    background-color: #4f9cc6;
    color: white;
    padding: 0.5rem;
  }
  .cancelbtn:hover{

    width: 25%;
    background-color: #4f9cc6;
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
