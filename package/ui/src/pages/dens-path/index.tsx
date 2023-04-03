import {
  Button,
  CircularProgress,
  Fade,
  Grid,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import { Fragment, Suspense, useMemo } from "react";
import { useMutation, useQueryClient } from "react-query";
import { DeliverTxResponse } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toBase64, toUtf8 } from "@cosmjs/encoding";

import useFormData from "../../hooks/use-form-data";
import Path, { pathValidator } from "./components/path";
import SelectRoot from "./components/select-root";
import useScrollPosition from "../../hooks/use-scroll-position";
import { useRecoilState, useRecoilValue } from "recoil";
import { keplrState, signClientState } from "../../state/cosmos";
import KeplrButton from "../../components/keplr-button";
import Joi from "joi";
import CheckAvailability, {
  Loading as CheckAvailabilityLoading,
} from "./components/check-availability";
import { snackbarState } from "../../state/snackbar";
import HowlPreview from "./components/howl-preview";

function ScrollDown({ children }: { children: any }) {
  const scrollPosition = useScrollPosition();

  return (
    <Box
      sx={{
        opacity: 1 - Math.min(1, scrollPosition / 500),
      }}
    >
      {children}
    </Box>
  );
}

const densPathValidator = Joi.object({
  path: pathValidator.required(),
  TLD: Joi.object().unknown(true),
  available: Joi.bool(),
});

export default function DensPath() {
  const { formState, onChange, setFormState } = useFormData({
    path: "",
    TLD: null,
    available: false,
  });

  const keplr = useRecoilValue(keplrState);
  const signClient = useRecoilValue(signClientState);
  const queryClient = useQueryClient();

  const getEnabled = useMemo<boolean>(() => {
    return densPathValidator.validate(formState.toJSON()).error == null;
  }, [formState]);

  const { mutateAsync: mintNFT, isLoading: isMintNFTLoading } =
    useMutation<DeliverTxResponse | null>(["mint_nft"], async () => {
      if (!signClient) {
        return null;
      }

      if (!keplr.account) {
        return null;
      }

      const msgs: any[] = [];
      const isFree = !formState.get("TLD").payment_details.payment_details;
      const feeIsNative =
        formState.get("TLD").payment_details.payment_details?.native;

      if (isFree || feeIsNative) {
        const mintMsg = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: keplr.account,
            contract: formState.get("TLD").tld,
            msg: toUtf8(
              JSON.stringify({
                mint_path: {
                  path: formState.get("path"),
                },
              })
            ),

            funds: [],
          }),
        };

        if (!isFree) {
          mintMsg.value.funds.push(
            formState.get("TLD").payment_details.payment_details?.native
          );
        }

        msgs.push(mintMsg);
      } else if (formState.get("TLD").payment_details.payment_details?.cw20) {
        const mintMsg = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: keplr.account,
            contract:
              formState.get("TLD").payment_details.payment_details?.cw20
                .token_address,
            msg: toUtf8(
              JSON.stringify({
                send: {
                  amount:
                    formState.get("TLD").payment_details.payment_details?.cw20
                      .amount,
                  contract: formState.get("TLD").tld,
                  msg: toBase64(
                    toUtf8(
                      JSON.stringify({
                        mint_path: {
                          path: formState.get("path"),
                        },
                      })
                    )
                  ),
                },
              })
            ),

            funds: [],
          }),
        };

        msgs.push(mintMsg);
      }

      const gas = await signClient.simulate(keplr.account, msgs, "");

      const result = await signClient.signAndBroadcast(keplr.account, msgs, {
        amount: [{ amount: "0.025", denom: "ujuno" }],
        gas: Math.ceil(gas * 1.1) + "",
      });

      queryClient.setQueryData(
        [
          "check_availability",
          formState.get("TLD").whoami_address,
          formState.get("TLD").token_id + "::" + formState.get("path"),
        ],
        keplr.account
      );

      return result;
    });

  const [, setSnackbar] = useRecoilState(snackbarState);

  return (
    <Box sx={{ mt: { sm: 0, md: 5 }, height: "100%", position: "relative" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Buy (de)NS path domain
      </Typography>
      <Box sx={{ mt: { xs: 5, sm: 8 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <SelectRoot formData={formState} onChange={onChange} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Path formData={formState} onChange={onChange} />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          textAlign: "right",
          display: "flex",
          width: "100%",
          justifyContent: "right",
          gap: 3,
          py: 4,
        }}
      >
        {formState.get("TLD") && formState.get("path") && getEnabled && (
          <Suspense fallback={<CheckAvailabilityLoading />}>
            <CheckAvailability
              setFormState={setFormState}
              path={formState.get("path")}
              token_id={formState.get("TLD")?.token_id}
              whoami_address={formState.get("TLD")?.whoami_address}
            />
          </Suspense>
        )}

        {keplr.account ? (
          <Button
            variant="contained"
            disableElevation
            color="secondary"
            size="large"
            target={"_blank"}
            startIcon={
              isMintNFTLoading ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : (
                <AddShoppingCartIcon />
              )
            }
            href=""
            onClick={async () => {
              try {
                await mintNFT();

                setSnackbar({
                  message: `Path ${
                    formState.get("TLD").token_id + "::" + formState.get("path")
                  } successfully minted`,
                });
              } catch (e: any) {
                setSnackbar({
                  message: "Error minting path: " + e.message,
                });
              }
            }}
            disabled={
              !getEnabled || !formState.get("available") || isMintNFTLoading
            }
          >
            {isMintNFTLoading && <Fragment>MINTING</Fragment>}

            {!isMintNFTLoading && (
              <Fragment>
                {!formState.get("TLD") && (
                  <Fragment>Select root domain</Fragment>
                )}

                {formState.get("TLD") && (
                  <Fragment>
                    {!formState.get("path") && <Fragment>Type path</Fragment>}

                    {formState.get("path") && (
                      <Fragment>
                        {formState.get("TLD").price_label && (
                          <Fragment>
                            Buy for {formState.get("TLD").price_label}
                          </Fragment>
                        )}

                        {!formState.get("TLD").price_label && (
                          <Fragment>Get for FREE</Fragment>
                        )}
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Fragment>
            )}
          </Button>
        ) : (
          <KeplrButton />
        )}
      </Box>

      <ScrollDown>
        <Fade in={formState.get("available") && getEnabled}>
          <Box sx={{ mt: 4 }}>
            <HowlPreview
              name={
                formState.get("TLD")?.token_id + "::" + formState.get("path")
              }
            />
          </Box>
        </Fade>
      </ScrollDown>

      <Box
        sx={{
          position: "absolute",
          bottom: "0",
          textAlign: "center",
          width: "100%",
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <ScrollDown>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Scroll for more information
          </Typography>
          <ExpandMoreIcon />
        </ScrollDown>
      </Box>
    </Box>
  );
}
