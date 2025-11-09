import os
from alembic.config import Config
from alembic import command

def run_migrations():
    # Get the directory where this script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up the Alembic configuration
    config = Config(os.path.join(base_dir, 'alembic.ini'))
    
    # Set the script location
    config.set_main_option('script_location', os.path.join(base_dir, 'alembic'))
    
    # Generate the migration
    print("Generating migration...")
    command.revision(config, autogenerate=True, message="Add maintenance tables")
    
    # Apply the migration
    print("\nApplying migration...")
    command.upgrade(config, 'head')
    
    print("\nDatabase migration completed successfully!")

if __name__ == '__main__':
    run_migrations()
