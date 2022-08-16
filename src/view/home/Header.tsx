import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { DropDown, DropDownList, ListItem } from "../components/DropDown";
import { ArrowDownIcon, CheckIcon, UserIcon } from "../components/Icons";
import { AccountStateContext, NetworkContext } from "../context";
import { messageBackground } from "../event";
import { QueryType, useMutateStore } from "../lib/state";
import { useSelectWalletMutation } from "../lib/state/account";
import { networkConfigs } from "../lib/state/network";
import { useBalance, WalletState } from "../lib/state/wallet";
import { AppRoute } from "../routes";
import { ConnectRoutes } from "../screen/connect/ConnectWallet";

const Head = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.lightGray};
`;

const Menu = styled.div`
  width: 300px;
`;

const Item = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Divider = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.gray};
`;

const Balance = styled.span`
  margin-left: ${(props) => props.theme.padding};
  color: ${(props) => props.theme.darkGray};
`;

const AccountItem = styled(ListItem)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Account: FC<{
  onClick: () => void;
  wallet: WalletState;
  active?: string;
}> = ({ onClick, wallet, active }) => {
  const { data } = useBalance(wallet.address);
  return (
    <AccountItem onClick={onClick}>
      {wallet.address === active && (
        <>
          <CheckIcon />{" "}
        </>
      )}
      {wallet.name}
      {data && <Balance>{data} TON</Balance>}
    </AccountItem>
  );
};

export const Header: FC<{ lock: boolean }> = ({ lock }) => {
  const navigate = useNavigate();
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);

  const { mutate } = useMutateStore<string>(QueryType.network);

  const { mutateAsync: mutateSelect, reset: resetSelect } =
    useSelectWalletMutation();

  const onLock = useCallback(() => {
    messageBackground({ method: "lock" });
  }, []);

  const onSelect = useCallback(
    async (address: string) => {
      resetSelect();
      await mutateSelect(address);
    },
    [resetSelect, mutateSelect]
  );

  return (
    <Head>
      <img src="tonmask-logo.svg" width="38" height="38" alt="TonMask Logo" />
      <DropDownList
        options={networkConfigs}
        renderOption={(c) => c.name}
        onSelect={(c) => mutate(c.name)}
      >
        <Badge>
          {network} <ArrowDownIcon />
        </Badge>
      </DropDownList>
      {!lock && account && (
        <DropDown
          payload={(onClose) => (
            <Menu>
              <Item>
                <span>Accounts</span>
                <Badge onClick={onLock}>Lock</Badge>
              </Item>
              <Divider />
              {account.wallets.map((wallet) => (
                <Account
                  key={wallet.address}
                  wallet={wallet}
                  active={account.activeWallet}
                  onClick={() => {
                    onSelect(wallet.address);
                    onClose();
                  }}
                />
              ))}
              {account.wallets.length !== 0 && <Divider />}
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.connect + ConnectRoutes.create);
                }}
              >
                Create Wallet
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.connect + ConnectRoutes.import);
                }}
              >
                Import Wallet
              </ListItem>
              <Divider />
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.setting);
                }}
              >
                Account Settings
              </ListItem>
            </Menu>
          )}
        >
          <Icon>
            <UserIcon />
          </Icon>
        </DropDown>
      )}
    </Head>
  );
};