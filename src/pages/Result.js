import { List } from "./styled-components/List";

export const Result = ( {userList, readyClickHandler} ) => {
    return (
        <div>
        <h1>結果発表</h1>
        <List items={userList} />
        </div>
    );
};