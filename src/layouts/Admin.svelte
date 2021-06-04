<script>
  import { Router, Route } from "svelte-routing";

  // components for this layout
  import AdminNavbar from "components/Navbars/AdminNavbar.svelte";
  import Sidebar from "components/Sidebar/Sidebar.svelte";
  import HeaderStats from "components/Headers/HeaderStats.svelte";
  import FooterAdmin from "components/Footers/FooterAdmin.svelte";


  // pages for this layout
  import Dashboard from "views/admin/Dashboard.svelte";
  import AddCurrency from "views/admin/AddCurrency.svelte";
  import Expenses from "views/admin/Expenses.svelte";

  export let location;
  export let admin = "";
</script>

<div >
  <Sidebar location={location}/>
  <div class="relative md:ml-64 bg-blueGray-100" style="height:100vh">
    <AdminNavbar />
    <HeaderStats />
    <div class="md:px-10  w-full bg-blueGray-100 pt-6">
      <Router url="admin">
        <Route path="dashboard" component="{Dashboard}" />
        <Route path="plus" component="{AddCurrency}"/>
        <Route path="purse/:purseTitle" component="{Expenses}"/>
      </Router>
      <FooterAdmin />
    </div>

  </div>
</div>
