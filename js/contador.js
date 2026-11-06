// contador.js - Contador de Visitas Isolado com Firebase
(function () {
  // 1. Inicializa o Firebase apenas se ainda não foi inicializado
  if (!firebase.apps.length) {
    const firebaseConfig = {
      apiKey: "AIzaSyBuMAX0E2UqMxuzJcMsz3ZVDEw-pYIiPYE",
      authDomain: "boxfiguras.firebaseapp.com",
      projectId: "boxfiguras",
      storageBucket: "boxfiguras.firebasestorage.app",
      messagingSenderId: "912903668601",
      appId: "1:912903668601:web:a4134a15b5170fa7f525a8",
      measurementId: "G-RQ2GRWNYD9"
    };
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.database();
  const counterRef = db.ref("total_visitas");
  const elContador = document.getElementById("contadorVisitasValor");

  // 2. Incrementa o contador 1x por sessão do navegador (evita flood no F5)
  if (!sessionStorage.getItem("boxfiguras_visitou")) {
    counterRef.transaction(function (current) {
      return (current || 0) + 1;
    });
    sessionStorage.setItem("boxfiguras_visitou", "true");
  }

  // 3. Atualiza o número na tela em tempo real
  counterRef.on("value", function (snapshot) {
    if (elContador) {
      const valor = snapshot.val() || 0;
      elContador.textContent = valor.toLocaleString("pt-BR");
    }
  });
})();