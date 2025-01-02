-- Create Items Table
CREATE TABLE Items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    description TEXT
);

-- Create ProjectInventory Table
CREATE TABLE ProjectInventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

-- Create Transactions Table
CREATE TABLE Transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    action TEXT NOT NULL CHECK (action IN ('borrow', 'return')),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

-- Create InventoryLog Table
CREATE TABLE InventoryLog (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('add', 'update', 'delete')),
    quantity_change INTEGER NOT NULL,
    change_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id)
);

-- Trigger: Prevent Borrowing More Items Than Available
CREATE TRIGGER BeforeBorrow
BEFORE INSERT ON Transactions
FOR EACH ROW
WHEN NEW.action = 'borrow' AND (
    SELECT quantity FROM Items WHERE item_id = NEW.item_id
) < NEW.quantity
BEGIN
    SELECT RAISE(ABORT, 'Insufficient quantity in main inventory for this borrow request.');
END;

-- Update the Items table only if the action is 'borrow'
CREATE TRIGGER UpdateItemsForBorrow
AFTER INSERT ON Transactions
FOR EACH ROW
WHEN NEW.action = 'borrow'
BEGIN
    UPDATE Items
    SET quantity = quantity - NEW.quantity
    WHERE item_id = NEW.item_id;
END;


-- Trigger: Prevent Returning Items Not Borrowed
CREATE TRIGGER BeforeReturn
BEFORE INSERT ON Transactions
FOR EACH ROW
WHEN NEW.action = 'return' AND (
    SELECT quantity FROM ProjectInventory WHERE project_id = NEW.project_id AND item_id = NEW.item_id
) < NEW.quantity
BEGIN
    SELECT RAISE(ABORT, 'Cannot return more items than currently borrowed.');
END;

-- Update the ProjectInventory and Items tables only if the action is 'return'
CREATE TRIGGER UpdateItemsForReturn
AFTER INSERT ON Transactions
FOR EACH ROW
WHEN NEW.action = 'return'
BEGIN
    UPDATE ProjectInventory
    SET quantity = quantity - NEW.quantity
    WHERE project_id = NEW.project_id AND item_id = NEW.item_id;

    UPDATE Items
    SET quantity = quantity + NEW.quantity
    WHERE item_id = NEW.item_id;
END;

-- Before delete
CREATE TRIGGER BeforeDeleteProject
BEFORE DELETE ON Projects
FOR EACH ROW
BEGIN
    -- Safely return all items from the project's inventory to the main inventory
    UPDATE Items
    SET quantity = quantity + COALESCE((
        SELECT SUM(quantity)
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    ), 0)
    WHERE item_id IN (
        SELECT item_id
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    );

    -- Explicitly delete the project's inventory if not using ON DELETE CASCADE
    DELETE FROM ProjectInventory WHERE project_id = OLD.project_id;
END;

-- Trigger: Log All Inventory Changes
-- Log additions
CREATE TRIGGER LogInventoryInsert
AFTER INSERT ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (NEW.item_id, 'insert', NEW.quantity, CURRENT_TIMESTAMP);
END;

-- Log updates
CREATE TRIGGER LogInventoryUpdate
AFTER UPDATE ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (NEW.item_id, 'update', NEW.quantity - COALESCE(OLD.quantity, 0), CURRENT_TIMESTAMP);
END;

-- Log deletions
CREATE TRIGGER LogInventoryDelete
AFTER DELETE ON Items
FOR EACH ROW
BEGIN
    INSERT INTO InventoryLog (item_id, change_type, quantity_change, change_timestamp)
    VALUES (OLD.item_id, 'delete', -OLD.quantity, CURRENT_TIMESTAMP);
END;
