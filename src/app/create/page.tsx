import { CreateTokenForm } from '@/components/create/CreateTokenForm';

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Create Token</h1>
        <p className="text-gray-400">
          Launch your token with a fair bonding curve. No presale, no team allocation.
        </p>
      </div>
      <CreateTokenForm />
    </div>
  );
}
