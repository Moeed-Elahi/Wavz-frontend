'use client';

import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useLaunchpadActions } from '@/hooks/useProgram';

interface FormData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  imagePreview: string;
  twitter: string;
  telegram: string;
  website: string;
}

interface AntiSnipeSettings {
  enabled: boolean;
  maxWalletBps: number;
  lockDuration: number;
  batchDuration: number;
  minTrustScore: number;
  requireCivic: boolean;
}

export const CreateTokenForm: FC = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const { createToken, buy } = useLaunchpadActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const nameCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
    image: null,
    imagePreview: '',
    twitter: '',
    telegram: '',
    website: '',
  });
  
  // Anti-snipe settings with defaults (enabled by default)
  const [antiSnipe, setAntiSnipe] = useState<AntiSnipeSettings>({
    enabled: true,
    maxWalletBps: 200,      // 2% max wallet
    lockDuration: 300,      // 5 minute lock
    batchDuration: 30,      // 30 second batches
    minTrustScore: 20,      // Min 20 trust score
    requireCivic: false,    // Civic optional
  });

  // Initial buy amount (optional - helps protect from snipers)
  const [initialBuyAmount, setInitialBuyAmount] = useState<string>('');

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Check name uniqueness with debounce
  const checkNameAvailability = useCallback(async (name: string) => {
    if (!name || name.trim().length < 2) {
      setNameStatus('idle');
      return;
    }

    setNameStatus('checking');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    try {
      const response = await fetch(`${API_URL}/api/tokens/check-name/${encodeURIComponent(name.trim())}`);
      const data = await response.json();
      setNameStatus(data.available ? 'available' : 'taken');
    } catch (error) {
      console.error('Error checking name:', error);
      setNameStatus('idle');
    }
  }, []);

  // Debounced name change handler
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({ ...prev, name: newName }));
    
    // Clear previous timeout
    if (nameCheckTimeout.current) {
      clearTimeout(nameCheckTimeout.current);
    }
    
    // Set new debounced check
    nameCheckTimeout.current = setTimeout(() => {
      checkNameAvailability(newName);
    }, 500);
  }, [checkNameAvailability]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (nameCheckTimeout.current) {
        clearTimeout(nameCheckTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.name || !formData.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    if (nameStatus === 'taken') {
      toast.error('Token name is already taken. Please choose a unique name.');
      return;
    }

    if (nameStatus === 'checking') {
      toast.error('Please wait for name validation to complete');
      return;
    }

    if (!formData.image) {
      toast.error('Please upload a token image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image and metadata to backend
      toast.loading('Uploading metadata...', { id: 'create' });
      
      const formDataUpload = new FormData();
      formDataUpload.append('image', formData.image);
      formDataUpload.append('name', formData.name);
      formDataUpload.append('symbol', formData.symbol);
      formDataUpload.append('description', formData.description);
      if (formData.twitter) formDataUpload.append('twitter', formData.twitter);
      if (formData.telegram) formDataUpload.append('telegram', formData.telegram);
      if (formData.website) formDataUpload.append('website', formData.website);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const uploadRes = await fetch(`${API_URL}/api/metadata/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload metadata');
      }

      const { metadataUri } = await uploadRes.json();
      console.log('Metadata uploaded:', metadataUri);
      
      toast.loading('Creating token on Solana...', { id: 'create' });
      
      // Call the actual Anchor program with anti-snipe config
      // If initial buy is specified, disable batch auction (batchDuration=0) because
      // the on-chain program blocks ALL direct buys during the batch window (even creator)
      const effectiveAntiSnipe = antiSnipe.enabled ? {
        ...antiSnipe,
        batchDuration: (initialBuyAmount && parseFloat(initialBuyAmount) > 0) ? 0 : antiSnipe.batchDuration,
      } : undefined;
      
      const result = await createToken(
        formData.name,
        formData.symbol,
        metadataUri,
        30_000_000_000, // 30 SOL virtual reserves
        1_000_000_000_000_000, // 1B tokens virtual reserves
        effectiveAntiSnipe
      );
      
      console.log('Token created on-chain:', result);
      
      // Save token to database before redirecting
      try {
        await fetch(`${API_URL}/api/tokens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mint: result.mint,
            name: formData.name,
            symbol: formData.symbol,
            uri: metadataUri,
            creatorAddress: publicKey?.toBase58(),
            description: formData.description,
          }),
        });
      } catch (dbError) {
        console.error('Failed to save to DB:', dbError);
        // Continue anyway - indexer will catch it
      }
      
      toast.success('Token created successfully!', { id: 'create' });
      console.log('Token created:', result);

      // Perform initial buy if amount specified
      if (initialBuyAmount && parseFloat(initialBuyAmount) > 0 && result?.mint) {
        try {
          toast.loading('Buying initial tokens...', { id: 'initial-buy' });
          const buyAmountLamports = parseFloat(initialBuyAmount) * 1e9;
          console.log('Calling buy with mint:', result.mint, 'amount:', buyAmountLamports);
          const buyTx = await buy(result.mint, buyAmountLamports, 500); // 5% slippage for initial buy
          console.log('Initial buy confirmed:', buyTx);
          toast.success('Initial tokens purchased!', { id: 'initial-buy' });
        } catch (buyError) {
          console.error('Initial buy failed:', buyError);
          toast.error('Token created but initial buy failed', { id: 'initial-buy' });
        }
      }

      // Redirect to token page
      router.push(`/token/${result.mint}`);
    } catch (error: unknown) {
      console.error('Error creating token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create token';
      
      // Handle "already processed" as success
      if (errorMessage.includes('already been processed') || errorMessage.includes('AlreadyProcessed')) {
        toast.success('Token created successfully!', { id: 'create' });
        return;
      }
      
      toast.error(errorMessage, { id: 'create' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Token Image *</label>
        <div className="flex items-center space-x-4">
          <label className="relative cursor-pointer">
            <div
              className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${
                formData.imagePreview
                  ? 'border-primary-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {formData.imagePreview ? (
                <Image
                  src={formData.imagePreview}
                  alt="Preview"
                  fill
                  className="rounded-xl object-cover"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <div className="text-sm text-gray-400">
            <p>Upload a square image</p>
            <p>Max 5MB, PNG/JPG/GIF</p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Token Name *</label>
        <div className="relative">
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., Moon Doge"
            maxLength={32}
            className={`input-field pr-10 ${
              nameStatus === 'taken' ? 'border-red-500 focus:border-red-500' : 
              nameStatus === 'available' ? 'border-green-500 focus:border-green-500' : ''
            }`}
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {nameStatus === 'checking' && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}
            {nameStatus === 'available' && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {nameStatus === 'taken' && (
              <X className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{formData.name.length}/32</p>
          {nameStatus === 'taken' && (
            <p className="text-xs text-red-500">This name is already taken</p>
          )}
          {nameStatus === 'available' && (
            <p className="text-xs text-green-500">Name is available</p>
          )}
        </div>
      </div>

      {/* Symbol */}
      <div>
        <label className="block text-sm font-medium mb-2">Symbol *</label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) =>
            setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
          }
          placeholder="e.g., MDOGE"
          maxLength={10}
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">{formData.symbol.length}/10</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Tell us about your token..."
          rows={4}
          maxLength={500}
          className="input-field resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/500
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Social Links (Optional)</h3>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Twitter</label>
          <input
            type="url"
            value={formData.twitter}
            onChange={(e) =>
              setFormData({ ...formData, twitter: e.target.value })
            }
            placeholder="https://twitter.com/..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Telegram</label>
          <input
            type="url"
            value={formData.telegram}
            onChange={(e) =>
              setFormData({ ...formData, telegram: e.target.value })
            }
            placeholder="https://t.me/..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder="https://..."
            className="input-field"
          />
        </div>
      </div>

      {/* Anti-Snipe Protection */}
      <div className="border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Fair Launch Protection</h3>
            <p className="text-xs text-gray-500">Prevent bots and snipers</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={antiSnipe.enabled}
              onChange={(e) => setAntiSnipe({ ...antiSnipe, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>

        {antiSnipe.enabled && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            {/* 30s Batch Auction */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">30s Batch Auction</p>
                <p className="text-xs text-gray-500">Eliminates MEV/front-running</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiSnipe.batchDuration > 0}
                  onChange={(e) => setAntiSnipe({ ...antiSnipe, batchDuration: e.target.checked ? 30 : 0 })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* 2% Wallet Cap */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">2% Wallet Cap</p>
                <p className="text-xs text-gray-500">Max holdings per wallet</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiSnipe.maxWalletBps > 0}
                  onChange={(e) => setAntiSnipe({ ...antiSnipe, maxWalletBps: e.target.checked ? 200 : 0 })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* 5min Time Lock */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">5min Time Lock</p>
                <p className="text-xs text-gray-500">Tokens locked after purchase</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiSnipe.lockDuration > 0}
                  onChange={(e) => setAntiSnipe({ ...antiSnipe, lockDuration: e.target.checked ? 300 : 0 })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Trust Score */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Min Trust Score: {antiSnipe.minTrustScore}</p>
                <p className="text-xs text-gray-500">Require wallet reputation</p>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={antiSnipe.minTrustScore}
                onChange={(e) => setAntiSnipe({ ...antiSnipe, minTrustScore: parseInt(e.target.value) })}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Civic Verification */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Civic Verification</p>
                <p className="text-xs text-gray-500">Require proof of human</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiSnipe.requireCivic}
                  onChange={(e) => setAntiSnipe({ ...antiSnipe, requireCivic: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Initial Buy Section */}
      <div className="border border-gray-700 rounded-xl p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium">Initial Purchase (Optional)</h3>
          <p className="text-xs text-gray-500">Buy tokens at creation to protect from snipers</p>
        </div>
        
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            value={initialBuyAmount}
            onChange={(e) => setInitialBuyAmount(e.target.value)}
            placeholder="0"
            className="input-field pr-16"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <span className="text-gray-400 text-sm">SOL</span>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">◎</span>
            </div>
          </div>
        </div>
        
        {initialBuyAmount && parseFloat(initialBuyAmount) > 0 && (
          <div className="mt-3 p-3 bg-primary-500/10 rounded-lg">
            <p className="text-xs text-primary-400">
              💡 You will buy tokens worth {initialBuyAmount} SOL immediately after creation. 
              As the creator, you&apos;re exempt from the 2% wallet cap during the first 5 minutes.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-primary-400 font-medium mb-1">How it works</p>
            <ul className="text-gray-400 space-y-1">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-primary-500" />
                <span>1 billion tokens created with fair bonding curve</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-primary-500" />
                <span>No presale, no team allocation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-primary-500" />
                <span>Graduates to Meteora at ~$69K market cap</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !connected}
        className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Token...</span>
          </>
        ) : (
          <span>{connected ? 'Create Token' : 'Connect Wallet to Create'}</span>
        )}
      </button>
    </form>
  );
};
