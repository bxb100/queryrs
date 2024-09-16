import { Action, ActionPanel, Form, Icon, List, useNavigation } from "@raycast/api";
import { execa } from "execa";
import { useCallback, useEffect, useState } from "react";
import { useStreamJSON } from "@raycast/utils";

const env = process.env;
env.PATH = env.PAHT + ":/opt/homebrew/bin";
const child = execa({ env: env })`queryrs`;

export default function Command() {
  const [path, setPath] = useState("");
  const { push } = useNavigation();

  const handleData = useCallback((data: string) => {
    if (data.length == 2) {
      return;
    }
    const path = data.toString().replace("\n", "").replace(">", "").trim();
    console.log(path);
    setPath(`file://${path}`);
  }, []);

  useEffect(() => {
    child.stdout.on("data", handleData);
    return () => {
      console.log("exit");
      child.stdout.off("data", handleData);
    };
  }, []);

  useEffect(() => {
    if (path) {
      push(<TmpView path={path} />);
    }
  }, [path]);

  return (
    <Form
      searchBarAccessory={<Form.LinkAccessory target="https://query.rs/" text="Query.rs" />}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={(values) => {
              child.stdin.write(`${values.query}\n`);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="query" title="Query" placeholder="Search Rust" />
      <Form.Separator />
      <Form.Description title="Misc" text={`:help, :book, :cargo, :stable, :tool, :yet`} />
      <Form.Description title="Docs" text={`/async, #cfg, vec -> usize`} />
      <Form.Description title="Crates" text={`!tokio, !!sqlx`} />
      <Form.Description title="Others" text={`e0038, %error, >try, ?slice`} />
    </Form>
  );
}

type Data = { content: string; description: string };

function TmpView({ path }: { path: string }) {
  const { data, isLoading, pagination } = useStreamJSON(path, {
    initialData: [] as Data[],
    pageSize: 20,
  });

  return (
    <List isLoading={isLoading} pagination={pagination}>
      {!data || data.length == 0 ? (
        <List.EmptyView icon={{ source: "logo-black.png" }} title={"No results found"} />
      ) : (
        data.map((item, index) => {
          const e = item as Data;
          const data = e.description.split("-");
          const isUrl = e.content.startsWith("http");
          return (
            <List.Item
              key={index}
              icon={"rust.png"}
              title={data[0].trim()}
              subtitle={data[1]?.trim()}
              accessories={[{ icon: isUrl ? Icon.Link : Icon.Text }]}
              actions={<ActionPanel>{isUrl && <Action.OpenInBrowser url={e.content} />}</ActionPanel>}
            />
          );
        })
      )}
    </List>
  );
}
