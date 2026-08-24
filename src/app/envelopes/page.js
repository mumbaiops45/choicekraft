import PageHeader from "../components/PageHeader";
import ProductGrid from "../components/ProductGrid";

const products = [
  { name: "Kraft Envelope A5", price: "₹679" },
  { name: "White Wove DL", price: "₹469" },
  { name: "Padded Mailer", price: "₹1,199" },
  { name: "Coloured Pack of 50", price: "₹1,399" },
  { name: "Window Envelope C4", price: "₹949" },
  { name: "Wax Seal Kit", price: "₹1,849" },
  { name: "Invitation Envelope", price: "₹1,599" },
  { name: "Document Wallet", price: "₹629" },
];

export const metadata = {
  title: "Envelopes | ChoiceKraft",
};

export default function EnvelopesPage() {
  return (
    <>
      <PageHeader title="Envelopes" crumb="ENVELOPES" />
      <ProductGrid items={products} />
    </>
  );
}
