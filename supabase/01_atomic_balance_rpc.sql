-- Migration to create an atomic balance update RPC

CREATE OR REPLACE FUNCTION update_balance_atomic(
  p_user_id UUID,
  p_asset TEXT,
  p_amount NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  -- Upsert the balance atomically
  INSERT INTO balances (user_id, asset, balance)
  VALUES (p_user_id, p_asset, p_amount)
  ON CONFLICT (user_id, asset) 
  DO UPDATE SET 
    balance = balances.balance + p_amount
  RETURNING balance INTO v_new_balance;

  RETURN v_new_balance;
END;
$$;
