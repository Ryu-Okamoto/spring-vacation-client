import { Button } from "./styled-components/Button";
import { List } from "./styled-components/List";

export const Waiting = ( {userList, readyClickHandler} ) => {
    return (
        <div>
        <h1>参加者</h1>
        <List items={userList} />
        <Button text="準備OK" onClick={readyClickHandler} />
        </div>
    );
};