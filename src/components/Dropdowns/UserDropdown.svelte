<script>
  // library for creating dropdown menu appear on click
  import { createPopper } from "@popperjs/core";

  // core components

  const image = "../assets/img/team-1-800x800.jpg";

  let dropdownPopoverShow = false;

  let btnDropdownRef;
  let popoverDropdownRef;

  const toggleDropdown = (event) => {
    event.preventDefault();
    if (dropdownPopoverShow) {
      dropdownPopoverShow = false;
    } else {
      dropdownPopoverShow = true;
      createPopper(btnDropdownRef, popoverDropdownRef, {
        placement: "bottom-start",
      });
    }
  };
</script>

<div>
  <a
    class="text-blueGray-500 block"
    href="#pablo"
    bind:this="{btnDropdownRef}"
    on:click="{toggleDropdown}"
  >
    <div class="items-center flex">
      <span
        class="w-12 h-12 text-xl text-white bg-blueGray-800 opacity-75 inline-flex items-center justify-center rounded-full"
      >
        <img
          class="w-full text-center rounded-full align-middle border-none shadow-lg fas fa-user"
         
         src="" alt=""/>
      </span>
    </div>
  </a>
  <div
    bind:this="{popoverDropdownRef}"
    class="bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48 {dropdownPopoverShow ? 'block':'hidden'}"
  >

    <a
      href="#pablo" on:click={(e) => e.preventDefault()}
      class="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
    >
      Something else here
    </a>
    <div class="h-0 my-2 border border-solid border-blueGray-100"></div>
    <a
      href="#pablo" on:click={(e) => e.preventDefault()}
      class="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
    >
      Log out
    </a>
  </div>
</div>
