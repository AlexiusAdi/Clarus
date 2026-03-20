import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

const SpendingCategories = () => {
  const [Food, setFood] = useState(60);
  const [transport, setTransport] = useState(40);
  const [bill, setBill] = useState(13);
  const [Shopping, setShopping] = useState(13);
  const [Entertaintment, setEntertaintment] = useState(13);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Food</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={Food} className="w-full" />
      </CardContent>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Transport</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={transport} className="w-full" />
      </CardContent>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Bill</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={bill} className="w-full" />
      </CardContent>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Bill</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={bill} className="w-full" />
      </CardContent>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Shopping</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={Shopping} className="w-full" />
      </CardContent>
      <CardContent>
        <div className="w-full flex justify-between">
          <span>Entertainment</span>
          <span>Rp 1,300,000</span>
        </div>
        <Progress value={Entertaintment} className="w-full" />
      </CardContent>
    </Card>
  );
};

export default SpendingCategories;
