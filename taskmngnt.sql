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
BEGIN
    -- Ensure the action is 'borrow'
    IF NEW.action = 'borrow' THEN
        -- Check if enough items are available in the main inventory
        DECLARE available_quantity INTEGER;
        SELECT quantity INTO available_quantity
        FROM Items
        WHERE item_id = NEW.item_id;

        IF available_quantity < NEW.quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient quantity in main inventory for this borrow request.';
        END IF;

        -- Reduce the quantity from the main inventory
        UPDATE Items
        SET quantity = quantity - NEW.quantity
        WHERE item_id = NEW.item_id;
    END IF;
END;

-- Trigger: Prevent Returning Items Not Borrowed
CREATE TRIGGER BeforeReturn
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    -- Ensure the action is 'return'
    IF NEW.action = 'return' THEN
        -- Check if the project has enough borrowed items to return
        DECLARE borrowed_quantity INTEGER;
        SELECT quantity INTO borrowed_quantity
        FROM ProjectInventory
        WHERE project_id = NEW.project_id AND item_id = NEW.item_id;

        IF borrowed_quantity < NEW.quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot return more items than currently borrowed.';
        END IF;

        -- Update the ProjectInventory table to reduce borrowed items
        UPDATE ProjectInventory
        SET quantity = quantity - NEW.quantity
        WHERE project_id = NEW.project_id AND item_id = NEW.item_id;

        -- Add the quantity back to the main inventory
        UPDATE Items
        SET quantity = quantity + NEW.quantity
        WHERE item_id = NEW.item_id;
    END IF;
END;

CREATE TRIGGER BeforeDeleteProject
BEFORE DELETE ON Projects
FOR EACH ROW
BEGIN
    -- Return all items from the project's inventory to the main inventory
    UPDATE Items
    SET quantity = quantity + (
        SELECT SUM(quantity)
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    )
    WHERE item_id IN (
        SELECT item_id
        FROM ProjectInventory
        WHERE project_id = OLD.project_id
    );

    -- Clear the project's inventory explicitly (optional but recommended for clarity)
    DELETE FROM ProjectInventory WHERE project_id = OLD.project_id;
END;

-- Trigger: Log All Inventory Changes
CREATE TRIGGER LogInventoryChange
AFTER UPDATE OR INSERT OR DELETE ON Items
FOR EACH ROW
BEGIN
    -- Log additions or updates
    IF NEW.quantity IS NOT NULL THEN
        INSERT INTO InventoryLog (item_id, change_type, quantity_change)
        VALUES (NEW.item_id, 'update', NEW.quantity - COALESCE(OLD.quantity, 0));
    END IF;

    -- Log deletions
    IF OLD.quantity IS NOT NULL AND NEW.quantity IS NULL THEN
        INSERT INTO InventoryLog (item_id, change_type, quantity_change)
        VALUES (OLD.item_id, 'delete', -OLD.quantity);
    END IF;
END;
