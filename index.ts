import * as dotenv from "dotenv";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";

async function main() {
  try {
    dotenv.config({ path: "config.txt" });
    // Notice:
    // Due to limitations in GitHub Actions, we are unable to use secrets to
    // store a secure mnemonic for the wallet during the testing of pull
    // requests from forked repositories by our contributors.
    // As a result, we are currently using a public wallet with an exposed mnemonic in
    // our test files when running tests in GH Actions.
    const mnemonic = process.env.MNEMONIC;
    // const mnemonic = "xx xx";

    const key = await mnemonicToWalletKey(mnemonic!.split(" "));
    const IS_TESTNET = process.env.IS_TESTNET === "true";
    const API_KEY = process.env.API_KEY;
    const TONCENTER_API_KEY = IS_TESTNET ? API_KEY : API_KEY; // obtain on https://toncenter.com
    // You can use your own instance of TON-HTTP-API or public toncenter.com
    const NODE_API_URL = IS_TESTNET
      ? "https://testnet.toncenter.com/api/v2/jsonRPC"
      : "https://toncenter.com/api/v2/jsonRPC";

    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });

    // initialize ton rpc client on testnet
    // const endpoint = await getHttpEndpoint({ network: "testnet" });
    // const client = new TonClient({ endpoint });
    //const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", apiKey: "f20ff0043ded8c132d0b4b870e678b4bbab3940788cbb8c8762491935cf3a460" });
    const client = new TonClient({
      endpoint: NODE_API_URL,
      apiKey: TONCENTER_API_KEY,
    });
    // make sure wallet is deployed
    if (!(await client.isContractDeployed(wallet.address))) {
      return console.log("钱包未部署");
    }

    const TO_ADDRESS = process.env.TO_ADDRESS;

    // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
      secretKey: key.secretKey,
      seqno: seqno,
      messages: [
        internal({
          to: TO_ADDRESS,
          value: "0", // 0.05 TON to mint NFT
          body: `data:application/json,{"p":"ton-20","op":"mint","tick":"bolt20","amt":"1000000000"}`, // optional comment
          bounce: true,
        }),
        internal({
          to: TO_ADDRESS,
          value: "0", // 0.05 TON to mint NFT
          body: `data:application/json,{"p":"ton-20","op":"mint","tick":"bolt20","amt":"1000000000"}`, // optional comment
          bounce: true,
        }),
        internal({
          to: TO_ADDRESS,
          value: "0", // 0.05 TON to mint NFT
          body: `data:application/json,{"p":"ton-20","op":"mint","tick":"bolt20","amt":"1000000000"}`, // optional comment
          bounce: true,
        }),
        internal({
          to: TO_ADDRESS,
          value: "0", // 0.05 TON to mint NFT
          body: `data:application/json,{"p":"ton-20","op":"mint","tick":"bolt20","amt":"1000000000"}`, // optional comment
          bounce: true,
        }),
      ],
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
      //console.log("waiting for transaction to confirm...");
      await sleep(150);
      currentSeqno = await walletContract.getSeqno();
    }
    console.log("交易已确认!");
  } catch (e) {
    console.log("rpc 错误:");
  } finally {
    // 不管成功还是出错，都等待一段时间再次执行 main 函数
    await sleep(1000); // 等待 1 秒（或您选择的任何时间）
    main(); // 递归调用 main 函数以继续循环
  }
}

main();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
