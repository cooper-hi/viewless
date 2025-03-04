import { createViewless } from "@/core";
import { createModal } from "@/model/createModal";
import { Button, Modal } from "antd";

const { Provider, useViewless } = createViewless(
  { dialog1: createModal() },
  {}
);

function Component1() {
  const { dialog1 } = useViewless();
  return (
    <>
      <Button onClick={dialog1.show} type="primary">
        Open Dialog
      </Button>
    </>
  );
}

function Component2() {
  const { dialog1 } = useViewless();
  return (
    <Modal
      title="This is a title."
      open={dialog1.visible}
      onOk={dialog1.hide}
      onCancel={dialog1.hide}
    >
      {" "}
      将弹框模型绑定到Modal组件，然后通过dialog1.show()和dialog1.hide()来控制弹框的显示和隐藏
    </Modal>
  );
}

export default function Dialog() {
  return (
    <Provider>
      <Component1 />
      <Component2 />
    </Provider>
  );
}
