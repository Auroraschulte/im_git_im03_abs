async function fetchData() {
  const res = await fetch('php/api-handler.php');
  return await res.json();
}
