document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchData();
  const container = document.getElementById("locations");

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "location-card";
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.visitors} visitors</p>
      <small>${item.date}</small>
    `;
    container.appendChild(div);
  });
});
