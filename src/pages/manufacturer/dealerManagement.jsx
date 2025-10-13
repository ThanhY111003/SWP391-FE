import { useState } from "react";
import { Table, Card, Button, Modal, Form, Input, Select, InputNumber, Tag } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const DealerManagement = () => {
  // Demo data
  const [dealers, setDealers] = useState([
    {
      id: 1,
      name: "Hà Nội Motors",
      level: "Level 1",
      quota: 100,
      currentUsage: 40,
      priceTable: "PriceTable_L1_2025",
      status: "Active",
    },
    {
      id: 2,
      name: "Sài Gòn Auto",
      level: "Level 2",
      quota: 50,
      currentUsage: 20,
      priceTable: "PriceTable_L2_2025",
      status: "Active",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);

  const [form] = Form.useForm();

  const showEditModal = (dealer) => {
    setEditingDealer(dealer);
    form.setFieldsValue(dealer);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingDealer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingDealer) {
        setDealers((prev) =>
          prev.map((d) => (d.id === editingDealer.id ? { ...d, ...values } : d))
        );
      } else {
        const newDealer = { id: Date.now(), status: "Active", ...values };
        setDealers([...dealers, newDealer]);
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    { title: "Dealer Name", dataIndex: "name", key: "name" },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      render: (lvl) => <Tag color="blue">{lvl}</Tag>,
    },
    {
      title: "Quota",
      key: "quota",
      render: (_, record) => `${record.currentUsage}/${record.quota}`,
    },
    { title: "Price Table", dataIndex: "priceTable", key: "priceTable" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "Active" ? "green" : "red"}>{s}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          type="primary"
          size="small"
          onClick={() => showEditModal(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card
        title="Dealer Management"
        extra={
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={showAddModal}
          >
            Add Dealer
          </Button>
        }
      >
        <Table
          dataSource={dealers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Modal thêm/sửa đại lý */}
      <Modal
        title={editingDealer ? "Edit Dealer" : "Add new Dealer"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Dealer Name"
            name="name"
            rules={[{ required: true, message: "Please enter the dealer name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Dealer Level"
            name="level"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Level 1">Level 1</Option>
              <Option value="Level 2">Level 2</Option>
              <Option value="Level 3">Level 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Quota" //Hạn mức
            name="quota"
            rules={[{ required: true, message: "Enter quota" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Price Table"
            name="priceTable"
            rules={[{ required: true, message: "Please enter the price table" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DealerManagement;
