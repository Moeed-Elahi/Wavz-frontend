/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/launchpad.json`.
 */
export type Launchpad = {
  "address": "EprHeZN3dC1eD6NZAkrav5QAmWADrB7huw2jUEzhnHdo",
  "metadata": {
    "name": "launchpad",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solana Token Launchpad with Bonding Curve"
  },
  "instructions": [
    {
      "name": "buy",
      "docs": [
        "Buy tokens from the bonding curve (with anti-snipe checks)"
      ],
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "The token mint"
          ]
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "walletProfile",
          "docs": [
            "Wallet profile for trust scoring - auto-created if needed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "feeRecipient",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        },
        {
          "name": "minTokensOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimOrder",
      "docs": [
        "Claim tokens from a settled batch auction"
      ],
      "discriminator": [
        164,
        202,
        83,
        197,
        77,
        171,
        96,
        234
      ],
      "accounts": [
        {
          "name": "mint",
          "docs": [
            "The token mint"
          ]
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "batchAuction",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104,
                  95,
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "account",
                "path": "batch_auction.batch_id",
                "account": "batchAuction"
              }
            ]
          }
        },
        {
          "name": "buyOrder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "batchAuction"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "bondingCurveTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "walletProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeConfig",
      "docs": [
        "Close config account (admin only, for migration)"
      ],
      "discriminator": [
        145,
        9,
        72,
        157,
        95,
        125,
        61,
        85
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createToken",
      "docs": [
        "Create a new token with bonding curve and anti-snipe protection"
      ],
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "The token mint"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "bondingCurveTokenAccount",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "initialVirtualSolReserves",
          "type": "u64"
        },
        {
          "name": "initialVirtualTokenReserves",
          "type": "u64"
        },
        {
          "name": "antiSnipe",
          "type": {
            "option": {
              "defined": {
                "name": "antiSnipeInput"
              }
            }
          }
        }
      ]
    },
    {
      "name": "graduate",
      "docs": [
        "Graduate token to Meteora DLMM when threshold is reached"
      ],
      "discriminator": [
        45,
        235,
        225,
        181,
        17,
        218,
        64,
        130
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "docs": [
            "close = treasury transfers all lamports to treasury and zeros the account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "docs": [
            "The token mint being graduated"
          ]
        },
        {
          "name": "bondingCurveTokenAccount",
          "docs": [
            "Bonding curve's token account (holds remaining tokens for liquidity)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "treasury",
          "docs": [
            "Treasury account to receive SOL for pool creation (config.authority)"
          ],
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury token account to receive tokens for liquidity"
          ],
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the launchpad configuration"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        },
        {
          "name": "graduationThreshold",
          "type": "u64"
        },
        {
          "name": "oracleAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "minTrustScore",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "antiSnipeEnabled",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "platformLpFeeBps",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "registerWallet",
      "docs": [
        "Register wallet profile for trust scoring"
      ],
      "discriminator": [
        181,
        141,
        102,
        82,
        135,
        213,
        141,
        8
      ],
      "accounts": [
        {
          "name": "walletProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "sell",
      "docs": [
        "Sell tokens back to the bonding curve (with lock checks)"
      ],
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "bondingCurveTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeRecipient",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        },
        {
          "name": "minSolOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleBatch",
      "docs": [
        "Settle a completed batch auction"
      ],
      "discriminator": [
        22,
        2,
        21,
        223,
        225,
        122,
        163,
        214
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "batchAuction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104,
                  95,
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "account",
                "path": "batch_auction.batch_id",
                "account": "batchAuction"
              }
            ]
          }
        },
        {
          "name": "bondingCurveTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeRecipient",
          "writable": true
        },
        {
          "name": "settler",
          "docs": [
            "Anyone can settle after batch ends"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submitBuyOrder",
      "docs": [
        "Submit buy order to batch auction (during anti-snipe period)"
      ],
      "discriminator": [
        60,
        184,
        205,
        56,
        145,
        101,
        84,
        228
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.mint",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "batchAuction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104,
                  95,
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "account",
                "path": "bonding_curve.current_batch_id",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "buyOrder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "batchAuction"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "walletProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        },
        {
          "name": "minTokensOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTrustScore",
      "docs": [
        "Update wallet trust score (oracle only)"
      ],
      "discriminator": [
        100,
        231,
        130,
        250,
        180,
        196,
        20,
        248
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "walletProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "wallet_profile.wallet",
                "account": "walletProfile"
              }
            ]
          }
        },
        {
          "name": "oracle",
          "docs": [
            "Oracle authority that can update trust scores"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "trustScore",
          "type": "u8"
        },
        {
          "name": "civicVerified",
          "type": "bool"
        },
        {
          "name": "civicToken",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "withdrawFees",
      "docs": [
        "Withdraw platform fees (admin only)"
      ],
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "batchAuction",
      "discriminator": [
        4,
        96,
        16,
        74,
        94,
        40,
        229,
        244
      ]
    },
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "buyOrder",
      "discriminator": [
        227,
        11,
        110,
        187,
        37,
        80,
        95,
        121
      ]
    },
    {
      "name": "launchpadConfig",
      "discriminator": [
        205,
        61,
        113,
        174,
        159,
        51,
        248,
        24
      ]
    },
    {
      "name": "walletProfile",
      "discriminator": [
        9,
        216,
        26,
        246,
        37,
        66,
        29,
        169
      ]
    }
  ],
  "events": [
    {
      "name": "antiSnipeBlockedEvent",
      "discriminator": [
        49,
        206,
        131,
        105,
        94,
        16,
        89,
        237
      ]
    },
    {
      "name": "batchOrderEvent",
      "discriminator": [
        72,
        232,
        118,
        127,
        20,
        118,
        224,
        79
      ]
    },
    {
      "name": "batchSettledEvent",
      "discriminator": [
        176,
        72,
        133,
        200,
        67,
        14,
        115,
        137
      ]
    },
    {
      "name": "graduationEvent",
      "discriminator": [
        10,
        246,
        223,
        127,
        48,
        98,
        149,
        55
      ]
    },
    {
      "name": "tokenCreatedEvent",
      "discriminator": [
        96,
        122,
        113,
        138,
        50,
        227,
        149,
        57
      ]
    },
    {
      "name": "tradeEvent",
      "discriminator": [
        189,
        219,
        127,
        211,
        78,
        230,
        97,
        238
      ]
    },
    {
      "name": "walletProfileEvent",
      "discriminator": [
        193,
        214,
        251,
        113,
        108,
        219,
        245,
        176
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "alreadyGraduated",
      "msg": "Token has already graduated"
    },
    {
      "code": 6003,
      "name": "notGraduated",
      "msg": "Token has not graduated yet"
    },
    {
      "code": 6004,
      "name": "thresholdNotReached",
      "msg": "Graduation threshold not reached"
    },
    {
      "code": 6005,
      "name": "invalidTokenAmount",
      "msg": "Invalid token amount"
    },
    {
      "code": 6006,
      "name": "invalidSolAmount",
      "msg": "Invalid SOL amount"
    },
    {
      "code": 6007,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6008,
      "name": "invalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6009,
      "name": "invalidFee",
      "msg": "Invalid fee"
    },
    {
      "code": 6010,
      "name": "nameTooLong",
      "msg": "Name too long (max 32 characters)"
    },
    {
      "code": 6011,
      "name": "symbolTooLong",
      "msg": "Symbol too long (max 10 characters)"
    },
    {
      "code": 6012,
      "name": "uriTooLong",
      "msg": "URI too long (max 200 characters)"
    },
    {
      "code": 6013,
      "name": "invalidInitialReserves",
      "msg": "Invalid initial reserves"
    },
    {
      "code": 6014,
      "name": "curveDepleted",
      "msg": "Bonding curve depleted"
    },
    {
      "code": 6015,
      "name": "maxWalletExceeded",
      "msg": "Max wallet limit exceeded"
    },
    {
      "code": 6016,
      "name": "tokensLocked",
      "msg": "Tokens are still locked"
    },
    {
      "code": 6017,
      "name": "insufficientTrustScore",
      "msg": "Insufficient trust score"
    },
    {
      "code": 6018,
      "name": "civicVerificationRequired",
      "msg": "Civic verification required"
    },
    {
      "code": 6019,
      "name": "walletProfileNotFound",
      "msg": "Wallet profile not found"
    },
    {
      "code": 6020,
      "name": "batchAuctionActive",
      "msg": "Batch auction active - use submit_buy_order instead"
    },
    {
      "code": 6021,
      "name": "batchAuctionNotActive",
      "msg": "Batch auction not active"
    },
    {
      "code": 6022,
      "name": "batchNotEnded",
      "msg": "Batch auction not ended"
    },
    {
      "code": 6023,
      "name": "batchAlreadySettled",
      "msg": "Batch already settled"
    },
    {
      "code": 6024,
      "name": "orderAlreadyFilled",
      "msg": "Order already filled"
    },
    {
      "code": 6025,
      "name": "invalidBatchAuction",
      "msg": "Invalid batch auction"
    },
    {
      "code": 6026,
      "name": "antiSnipeActive",
      "msg": "Anti-snipe features are active - restrictions apply"
    },
    {
      "code": 6027,
      "name": "invalidOracleAuthority",
      "msg": "Invalid oracle authority"
    },
    {
      "code": 6028,
      "name": "walletTooNew",
      "msg": "Wallet too new - minimum age required"
    },
    {
      "code": 6029,
      "name": "invalidCivicToken",
      "msg": "Invalid Civic gateway token"
    },
    {
      "code": 6030,
      "name": "invalidConfig",
      "msg": "Invalid config account"
    },
    {
      "code": 6031,
      "name": "unauthorized",
      "msg": "unauthorized"
    }
  ],
  "types": [
    {
      "name": "antiSnipeBlockedEvent",
      "docs": [
        "Anti-snipe blocked event"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "reason",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "antiSnipeConfig",
      "docs": [
        "Anti-snipe configuration for a token"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "enabled",
            "docs": [
              "Whether anti-snipe is enabled for this token"
            ],
            "type": "bool"
          },
          {
            "name": "maxWalletBps",
            "docs": [
              "Maximum wallet holding in basis points (100 = 1% of supply)"
            ],
            "type": "u16"
          },
          {
            "name": "lockDuration",
            "docs": [
              "Lock duration for purchased tokens (in seconds)"
            ],
            "type": "i64"
          },
          {
            "name": "batchDuration",
            "docs": [
              "Batch auction duration (in seconds), 0 = disabled"
            ],
            "type": "i64"
          },
          {
            "name": "minTrustScore",
            "docs": [
              "Minimum trust score required (0-100)"
            ],
            "type": "u8"
          },
          {
            "name": "requireCivic",
            "docs": [
              "Whether Civic verification is required"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "antiSnipeInput",
      "docs": [
        "Anti-snipe configuration input"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "enabled",
            "docs": [
              "Whether anti-snipe is enabled"
            ],
            "type": "bool"
          },
          {
            "name": "maxWalletBps",
            "docs": [
              "Max wallet in basis points (100 = 1% of supply)"
            ],
            "type": "u16"
          },
          {
            "name": "lockDuration",
            "docs": [
              "Lock duration in seconds (0 = no lock)"
            ],
            "type": "i64"
          },
          {
            "name": "batchDuration",
            "docs": [
              "Batch auction duration in seconds (0 = disabled)"
            ],
            "type": "i64"
          },
          {
            "name": "minTrustScore",
            "docs": [
              "Min trust score required (0-100)"
            ],
            "type": "u8"
          },
          {
            "name": "requireCivic",
            "docs": [
              "Whether Civic verification is required"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "batchAuction",
      "docs": [
        "Batch auction for delayed execution"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bondingCurve",
            "docs": [
              "The bonding curve this auction is for"
            ],
            "type": "pubkey"
          },
          {
            "name": "batchId",
            "docs": [
              "Batch ID"
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "Start timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "End timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalSolCommitted",
            "docs": [
              "Total SOL committed in this batch"
            ],
            "type": "u64"
          },
          {
            "name": "orderCount",
            "docs": [
              "Number of orders in batch"
            ],
            "type": "u32"
          },
          {
            "name": "settled",
            "docs": [
              "Whether batch has been settled"
            ],
            "type": "bool"
          },
          {
            "name": "settlementPrice",
            "docs": [
              "Final price (tokens per SOL after settlement)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "batchOrderEvent",
      "docs": [
        "Batch order submitted event"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "batchId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "batchSettledEvent",
      "docs": [
        "Batch settled event"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "batchId",
            "type": "u64"
          },
          {
            "name": "totalSol",
            "type": "u64"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "settlementPrice",
            "type": "u64"
          },
          {
            "name": "orderCount",
            "type": "u32"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bondingCurve",
      "docs": [
        "Bonding curve state for a token"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The token mint"
            ],
            "type": "pubkey"
          },
          {
            "name": "creator",
            "docs": [
              "Creator of the token"
            ],
            "type": "pubkey"
          },
          {
            "name": "virtualSolReserves",
            "docs": [
              "Virtual SOL reserves (for pricing)"
            ],
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "docs": [
              "Virtual token reserves (for pricing)"
            ],
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "docs": [
              "Real SOL reserves (actual SOL in the curve)"
            ],
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "docs": [
              "Real token reserves (tokens available for purchase)"
            ],
            "type": "u64"
          },
          {
            "name": "tokensPurchased",
            "docs": [
              "Total tokens ever purchased from curve"
            ],
            "type": "u64"
          },
          {
            "name": "graduated",
            "docs": [
              "Whether the token has graduated to DEX"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp of creation"
            ],
            "type": "i64"
          },
          {
            "name": "antiSnipe",
            "docs": [
              "Anti-snipe configuration"
            ],
            "type": {
              "defined": {
                "name": "antiSnipeConfig"
              }
            }
          },
          {
            "name": "currentBatchId",
            "docs": [
              "Current batch auction ID (increments each batch)"
            ],
            "type": "u64"
          },
          {
            "name": "batchEndTime",
            "docs": [
              "Current batch auction end time"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "buyOrder",
      "docs": [
        "Individual buy order in a batch auction"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchAuction",
            "docs": [
              "The batch auction this order belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "user",
            "docs": [
              "User who placed the order"
            ],
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "docs": [
              "SOL amount committed"
            ],
            "type": "u64"
          },
          {
            "name": "minTokensOut",
            "docs": [
              "Minimum tokens expected (slippage protection)"
            ],
            "type": "u64"
          },
          {
            "name": "filled",
            "docs": [
              "Whether order has been filled"
            ],
            "type": "bool"
          },
          {
            "name": "tokensReceived",
            "docs": [
              "Tokens received after settlement"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Order timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "graduationEvent",
      "docs": [
        "Graduation event (Meteora DLMM pool creation)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "platformLpFee",
            "docs": [
              "Platform LP fee taken (1% of total liquidity in SOL)"
            ],
            "type": "u64"
          },
          {
            "name": "meteoraPool",
            "docs": [
              "Meteora DLMM pool address (placeholder until CPI integration)"
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "launchpadConfig",
      "docs": [
        "Global configuration for the launchpad"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that can update config and withdraw fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "docs": [
              "Platform fee in basis points (100 = 1%)"
            ],
            "type": "u16"
          },
          {
            "name": "platformLpFeeBps",
            "docs": [
              "Platform LP fee in basis points (100 = 1%) - taken from LP at graduation"
            ],
            "type": "u16"
          },
          {
            "name": "graduationThreshold",
            "docs": [
              "SOL threshold to graduate to DEX (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalFeesCollected",
            "docs": [
              "Total fees collected (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalLpFeesCollected",
            "docs": [
              "Total LP fees collected (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalTokensCreated",
            "docs": [
              "Total tokens created"
            ],
            "type": "u64"
          },
          {
            "name": "oracleAuthority",
            "docs": [
              "Oracle authority for wallet verification"
            ],
            "type": "pubkey"
          },
          {
            "name": "minTrustScore",
            "docs": [
              "Minimum wallet trust score required (0-100)"
            ],
            "type": "u8"
          },
          {
            "name": "antiSnipeEnabled",
            "docs": [
              "Whether anti-snipe features are globally enabled"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenCreatedEvent",
      "docs": [
        "Token creation event"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tradeEvent",
      "docs": [
        "Trade event for indexing"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "isBuy",
            "type": "bool"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "walletProfile",
      "docs": [
        "Wallet profile for trust scoring"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "firstSeen",
            "docs": [
              "First interaction timestamp in this protocol"
            ],
            "type": "i64"
          },
          {
            "name": "interactionCount",
            "docs": [
              "Total number of interactions"
            ],
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "docs": [
              "Total SOL volume traded"
            ],
            "type": "u64"
          },
          {
            "name": "trustScore",
            "docs": [
              "Trust score (0-100), set by oracle or calculated"
            ],
            "type": "u8"
          },
          {
            "name": "civicVerified",
            "docs": [
              "Whether wallet has passed Civic verification"
            ],
            "type": "bool"
          },
          {
            "name": "civicToken",
            "docs": [
              "Civic gateway token (if verified)"
            ],
            "type": "pubkey"
          },
          {
            "name": "lastActive",
            "docs": [
              "Last interaction timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "walletProfileEvent",
      "docs": [
        "Wallet profile created/updated event"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "trustScore",
            "type": "u8"
          },
          {
            "name": "civicVerified",
            "type": "bool"
          },
          {
            "name": "interactionCount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
