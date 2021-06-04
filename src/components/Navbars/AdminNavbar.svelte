<script>
  // core components
  import UserDropdown from "components/Dropdowns/UserDropdown.svelte";
</script>

<!-- Navbar -->
<nav
  class="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4"
>
  <div
    class="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4"
  >
    <!-- Brand -->
    <div
      class="text-blueGray-500 text-lg uppercase hidden lg:inline-block font-semibold mt-3"
    >
      Overview
    </div>

<!--    &lt;!&ndash; User &ndash;&gt;-->
<!--    <ul class="flex-col md:flex-row list-none items-center hidden md:flex">-->
<!--      <UserDropdown />-->
<!--    </ul>-->
  </div>
</nav>
<!-- End Navbar -->
