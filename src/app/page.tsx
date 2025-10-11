import InvoiceForm from "@/components/InvoiceForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <main className="">
        <InvoiceForm />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
