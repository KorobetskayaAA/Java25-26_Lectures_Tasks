// Теорема Чебышева - сумма большого числа
// одинаково распределенных случайных чисел
// сходится к нормальному распределению.
// Генерируем очень много (n) равномерных случайных чисел
function testChebyshevTheorem(n) {
  let tStart = performance.now();

  let sum = 0,
    sumOfSquares = 0;
  for (let i = 0; i < n; i++) {
    let rnd = 0;
    for (let r = 0; r < 12; r++) {
      rnd += Math.random() - 0.5;
    }
    sum += rnd;
    sumOfSquares += rnd * rnd;
  }
  const mean = sum / n,
    sd = Math.sqrt(sumOfSquares / n - mean * mean);

  let tEnd = performance.now();
  console.log(`Generation took ${((tEnd - tStart) / 1000).toFixed(3)}s`);
  return { count: n, mean, sd };
}

function callChebyshev() {
  return testChebyshevTheorem(1e8);
}

async function callChebyshevAsync() {
  return testChebyshevTheorem(1e8);
}

window.addEventListener("load", () => {
  const resultElement = document.querySelector("#result-chebyshev");

  document
  .querySelector("#calc-direct")
  ?.addEventListener("click", () => {
    resultElement.innerHTML = "Начались вычисления";
    console.log("before call");
    let result = callChebyshev();
    console.log("after call", result);
    resultElement.innerHTML = `Сгенерировано чисел: ${result?.count}<br/> Среднее значение: ${result.mean}<br/> Стандартное отклонение: ${result.sd}`;
  });

  document
  .querySelector("#calc-then")
  ?.addEventListener("click", () => {
    resultElement.innerHTML = "Начались вычисления";
    console.log("before Promise");
    let promise = new Promise((resolve) => {
      let result = callChebyshev();
      resolve(result);
    });
    console.log("after Promise");
    promise.then((result) => {
      console.log("then", result);
      resultElement.innerHTML = `Сгенерировано чисел: ${result?.count}<br/> Среднее значение: ${result.mean}<br/> Стандартное отклонение: ${result.sd}`;
    });
  });

  document
    .querySelector("#calc-asyncawait")
    ?.addEventListener("click", async () => {
      resultElement.innerHTML = "Начались вычисления";
      console.log("before await");
      let result = await callChebyshevAsync();
      console.log("after await", result);
      resultElement.innerHTML = `Сгенерировано чисел: ${result?.count}<br/> Среднее значение: ${result.mean}<br/> Стандартное отклонение: ${result.sd}`;
    });

  document.querySelector("#calc-then-timeout").addEventListener("click", () => {
    resultElement.innerHTML = "Начались вычисления";
    console.log("before Promise");
    let promise = new Promise((resolve) => {
      setTimeout(() => {
        let result = callChebyshev();
        resolve(result);
      })
    });
    console.log("after Promise");
    promise.then((result) => {
      console.log("then", result);
      resultElement.innerHTML = `Сгенерировано чисел: ${result?.count}<br/> Среднее значение: ${result.mean}<br/> Стандартное отклонение: ${result.sd}`;
    });
  });

  document.querySelector("#calc-clear-result").addEventListener("click", () => {
    resultElement.replaceChildren();
  });
});
