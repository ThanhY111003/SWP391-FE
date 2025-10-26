export { default } from "../admin/priceTable";
/*
// Legacy file kept for backward compatibility. The implementation moved to src/pages/admin/priceTable.jsx
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Space,
  message,
  Tag,
// Moved: This file now re-exports the Admin version to keep backward compatibility
export { default } from "../admin/priceTable";
                      <Form.Item
                        {...restField}
                        name={[name, "model"]}
                        rules={[{ required: true, message: "Please enter the car model name!" }]}
                      >
                        <Select placeholder="Select car model" style={{ width: 180 }}>
                          <Option value="EV Car A">EV Car A</Option>
                          <Option value="EV SUV B">EV SUV B</Option>
                          <Option value="EV Truck C">EV Truck C</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Please enter the price!" }]}
                      >
                        <InputNumber
                          placeholder="Price"
                          min={10000}
                          step={100}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                      <Button onClick={() => remove(name)} type="link" danger>
                        Delete
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Price Row
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
*/
