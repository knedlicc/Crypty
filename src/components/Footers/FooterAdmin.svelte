<script>
  // make dynamic date to be added to footer
  let date = new Date().getFullYear();
</script>

<footer class="foot pb-4">
  <div class="">
    <hr class="mb-4 border-b-1 border-blueGray-200" />
    <div class="flex flex-wrap items-center md:justify-between justify-center">
      <div class="w-full md:w-6/12 px-20 ">
        <div
          class="text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left"
        >
          Copyright © {date}

            Andrey Bortnikov


        </div>

      </div>
      <div class="text-sm text-blueGray-500 font-semibold py-1 text-center text-right">
        ČVUT FEL, KAJ 2021
      </div>

    </div>
  </div>
</footer>
<style>
  .foot{
    position: fixed;
    bottom: 0;
    width: 100%;
    padding-right: 20rem;
    z-index: 2;
    background-color: rgba(241, 245, 249, 1);
  }

  @media screen and (max-width:768px){
    .foot{
      position: fixed;
      bottom: 0;
      width: 100%;
      padding-right: 0;
      z-index: 2;
      background-color: rgba(241, 245, 249, 1);
    }
  }
</style>

