import { useRef, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ToWords } from "to-words";


const loadCanvas = async (canvasEl, dataURL, canvasContextRef) => {
  const canvasContext = canvasEl.current.getContext("2d");
  const imageObj = new Image();

  canvasContextRef.current = canvasContext;
  imageObj.onload = function () {
    canvasContext.drawImage(this, 0, 0);
  };
  imageObj.src = dataURL;
};

const getQRImage = async ({ amount, name, upi }) => {
  try {
    return await (await fetch(`api/getqr/${name}/${upi}/${amount}`)).text();
  } catch (e) {
    console.log("API exception ", e);
    return "";
  }
};

const paintQR = async (canvasEl, canvasContextRef, { amount, name, upi }) => {
  const dataURL = await getQRImage({ amount, name, upi });
  await loadCanvas(canvasEl, dataURL, canvasContextRef);
};

const particlesInit = async (main) => {
  await loadFull(main);
};

const particlesLoaded = (container) => {
  console.log(container);
};

export default function Home() {
  const toWords = new ToWords();
  const canvasEl = useRef(null);
  const canvasContextRef = useRef(null);
  const [amount, setAmount] = useState(1);
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");

  const validate = async () => {
    if (!amount || !name || !upiId) {
      alert("Vaccant fields");
      console.warn("Enter all fields");
      return false;
    }
    if (amount < 1 || amount > 99999) {
      alert("Invalid amount");
      return false;
    }
    await paintQR(canvasEl, canvasContextRef, { amount, name, upi: upiId });
  };

  const clearFields = () => {
    setUpiId("");
    setName("");
    setAmount(1);
    canvasContextRef.current?.clearRect(
      0,
      0,
      canvasEl.current.width,
      canvasEl.current.height
    );
  };

  const getAmountInWords = () => {
    if (!amount) return <p>Nothing.</p>;
    if (amount <= 0) return <p>Invalid Amount</p>;
    return <p>{toWords.convert(amount, { currency: true })}!</p>;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Auto&apos;Pay&#128526;</title>
        <meta name="description" content="UPI QR code generator" />
        <link rel="icon" href="" />
      </Head>

      <main className={styles.main}>
        <h2>UPI QR Generator</h2>
        <canvas ref={canvasEl} id="qrCanvas" width="300" height="300" />
        {getAmountInWords()}
        <section className={styles.formSection}>
          <div>
            <label htmlFor={"id-amount"}>Amount :</label>
            <input
              id={"id-amount"}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={"id-upiid"}>UPI ID :</label>
            <input
              id={"id-upiid"}
              placeholder={"venkat@hdfc"}
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={"id-name"}>Name :</label>
            <input
              id={"id-name"}
              placeholder={"Venkat"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </section>
        <div className={styles.generateButton}>
          <button onClick={() => validate()}>Pay Now</button>
          <button onClick={() => clearFields()}>Clear</button>
        </div>
      </main>
      <footer className={styles.footer}>Abhishek@2023</footer>
    </div>
  );
}
